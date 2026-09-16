import { quoteAt } from "./market/quotes";
import { EARNINGS_HOURS, evaluateRisk } from "./risk/engine";
import { runResearch } from "./agents/research";
import { runSentiment } from "./agents/sentiment";
import { detectAnomalies, intendedSide, sizeOrder, stagePreview } from "./agents/execution";
import { bundleReceipts, stampReceipt, withReceipt } from "./agents/receipt";
import { bookToAccount } from "./holdings";
import { impactOf } from "./impact";
import { getInstrument } from "./universe";
import type {
  ActionReceipt,
  BookFile,
  DeskCycle,
  OrderPreview,
  RebalanceLeg,
  RebalancePlan,
  Side,
  SymbolCode,
} from "./types";

const TECH_CLUSTER: SymbolCode[] = ["rAAPL", "rNVDA", "rMSFT", "rAMZN"];

function nameCapQty(equity: number, px: number): number {
  return Math.max(0, Math.floor((equity * 0.12) / px));
}

function previewShell(args: {
  id: string;
  symbol: SymbolCode;
  side: Side;
  qty: number;
  limitPrice: number;
  research: OrderPreview["research"];
  sentiment: OrderPreview["sentiment"];
  risk: OrderPreview["risk"];
  ts: number;
}): OrderPreview {
  return {
    id: args.id,
    symbol: args.symbol,
    side: args.side,
    qty: args.qty,
    limitPrice: args.limitPrice,
    notional: args.qty * args.limitPrice,
    status: args.risk.verdict === "block" ? "rejected" : "preview",
    research: args.research,
    sentiment: args.sentiment,
    risk: args.risk,
    anomalies: [],
    previewUntil: args.ts,
    createdAt: args.ts,
  };
}

function deRiskTarget(
  lot: BookFile["lots"][number],
  book: BookFile,
  equity: number,
  px: number,
  ts: number,
): { target: number; reasons: string[] } {
  let target = lot.qty;
  const reasons: string[] = [];
  const maxQty = nameCapQty(equity, px);
  const earnings = EARNINGS_HOURS[lot.symbol];
  const inBlackout = earnings !== null && earnings <= 16;

  if (lot.qty > maxQty) {
    target = maxQty;
    const pct = ((lot.qty * px) / equity) * 100;
    reasons.push(`${lot.symbol} is ${pct.toFixed(1)}% of equity. Cap is 12%.`);
  }
  if (inBlackout && lot.qty > 0) {
    const cut = Math.floor(Math.min(target, lot.qty) * 0.45);
    target = Math.min(target, lot.qty - Math.max(cut, 1));
    reasons.push(`Earnings in ${earnings?.toFixed(1)}h. Cut overnight risk. Do not add.`);
  }

  if (TECH_CLUSTER.includes(lot.symbol)) {
    const clusterLots = book.lots.filter((l) => TECH_CLUSTER.includes(l.symbol));
    const clusterN = clusterLots.reduce((s, l) => s + l.qty * quoteAt(l.symbol, ts).mid, 0);
    const largest = Math.max(...clusterLots.map((l) => l.qty));
    if (clusterN > equity * 0.5 && lot.qty === largest) {
      target = Math.min(target, Math.floor(lot.qty * 0.7));
      reasons.push("Mega-cap tech cluster is above 50%. Trim the largest lot.");
    }
  }

  return { target, reasons };
}

function pushLeg(
  live: RebalanceLeg[],
  blocked: RebalanceLeg[],
  leg: RebalanceLeg,
) {
  if (leg.risk.verdict === "block" || leg.qty < 1) {
    blocked.push(leg);
  } else {
    live.push(leg);
  }
}

/**
 * Overnight knife: every book lot ends as a sized rToken action (buy / sell / hold)
 * with a receipt. De-risk sells win over alpha. Alpha only fires when research and
 * sentiment agree and risk clears.
 */
export function planRebalance(book: BookFile, ts = Date.now(), killSwitch = false): RebalancePlan {
  const account = bookToAccount(book, ts);
  const equity = account.equityUsdt;
  const live: RebalanceLeg[] = [];
  const blocked: RebalanceLeg[] = [];
  const holdReceipts: ActionReceipt[] = [];
  const cycles: DeskCycle[] = [];

  for (let i = 0; i < book.lots.length; i++) {
    const lot = book.lots[i];
    const tick = ts + i * 17;
    const quote = quoteAt(lot.symbol, tick);
    const px = quote.mid;
    const research = runResearch(lot.symbol, quote);
    const sentiment = runSentiment(lot.symbol, quote);
    const { target, reasons } = deRiskTarget(lot, book, equity, px, tick);

    // 1) De-risk sell when overnight gates require a cut
    if (target < lot.qty) {
      const rawQty = lot.qty - target;
      if (rawQty >= 1) {
        const side: Side = "sell";
        const risk = evaluateRisk({
          symbol: lot.symbol,
          side,
          qty: rawQty,
          quote,
          account,
          research,
          sentiment,
          killSwitch,
          earningsHours: EARNINGS_HOURS,
          purpose: "de-risk",
        });
        const sizedQty =
          risk.verdict === "block" ? rawQty : Math.max(1, Math.min(rawQty, risk.maxQty || rawQty));
        const limitPrice = quote.bid;
        const preview = previewShell({
          id: `derisk_${lot.symbol}`,
          symbol: lot.symbol,
          side,
          qty: sizedQty,
          limitPrice,
          research,
          sentiment,
          risk,
          ts: tick,
        });
        const reason = reasons.join(" ");
        const receipt = stampReceipt({
          symbol: lot.symbol,
          ts: tick,
          preview,
          risk,
          reason,
        });
        const leg: RebalanceLeg = {
          symbol: lot.symbol,
          side,
          qty: sizedQty,
          fromQty: lot.qty,
          toQty: lot.qty - sizedQty,
          purpose: "de-risk",
          reason,
          limitPrice,
          notional: sizedQty * limitPrice,
          risk,
          anomalies: detectAnomalies(quote, preview),
          receipt,
        };
        pushLeg(live, blocked, leg);
        cycles.push(
          withReceipt({
            symbol: lot.symbol,
            quote,
            research,
            sentiment,
            risk,
            preview: risk.verdict === "block" ? null : preview,
            receipt,
            ts: tick,
          }),
        );
        continue;
      }
    }

    // 2) Alpha ticket when research + sentiment agree
    const side = intendedSide(research, sentiment);
    if (side) {
      const qtyGuess = sizeOrder(equity, research.confidence, px, 1_000_000);
      const risk = evaluateRisk({
        symbol: lot.symbol,
        side,
        qty: Math.max(qtyGuess, 1),
        quote,
        account,
        research,
        sentiment,
        killSwitch,
        earningsHours: EARNINGS_HOURS,
        purpose: "alpha",
      });

      if (side === "sell" && lot.qty < 1) {
        // nothing to sell
      } else if (risk.verdict === "block" || risk.maxQty <= 0) {
        const holdReason = `HOLD 0 ${lot.symbol}. Alpha ${side} blocked by risk (${risk.verdict}).`;
        const receipt = stampReceipt({
          symbol: lot.symbol,
          ts: tick,
          preview: null,
          risk,
          reason: holdReason,
        });
        holdReceipts.push(receipt);
        cycles.push(
          withReceipt({
            symbol: lot.symbol,
            quote,
            research,
            sentiment,
            risk,
            preview: null,
            receipt,
            ts: tick,
          }),
        );
        continue;
      } else {
        let sizedQty = sizeOrder(equity, research.confidence, px, risk.maxQty || qtyGuess);
        if (side === "sell") sizedQty = Math.min(sizedQty, Math.floor(lot.qty));
        if (sizedQty >= 1) {
          const preview = stagePreview({
            quote,
            research,
            sentiment,
            risk,
            side,
            qty: sizedQty,
          });
          const reason =
            side === "buy"
              ? `Research ${research.bias}, sentiment ${sentiment.score.toFixed(0)}. Add overnight size.`
              : `Research ${research.bias}, sentiment ${sentiment.score.toFixed(0)}. Cut overnight size.`;
          const receipt = stampReceipt({
            symbol: lot.symbol,
            ts: tick,
            preview,
            risk,
            reason,
          });
          const toQty = side === "buy" ? lot.qty + sizedQty : lot.qty - sizedQty;
          const leg: RebalanceLeg = {
            symbol: lot.symbol,
            side,
            qty: sizedQty,
            fromQty: lot.qty,
            toQty,
            purpose: "alpha",
            reason,
            limitPrice: preview.limitPrice,
            notional: sizedQty * preview.limitPrice,
            risk,
            anomalies: detectAnomalies(quote, preview),
            receipt,
          };
          pushLeg(live, blocked, leg);
          cycles.push(
            withReceipt({
              symbol: lot.symbol,
              quote,
              research,
              sentiment,
              risk,
              preview,
              receipt,
              ts: tick,
            }),
          );
          continue;
        }
      }
    }

    // 3) Hold is a sized action (qty 0) with a receipt
    const risk = evaluateRisk({
      symbol: lot.symbol,
      side: "buy",
      qty: 1,
      quote,
      account,
      research,
      sentiment,
      killSwitch,
      earningsHours: EARNINGS_HOURS,
      purpose: "alpha",
    });
    const holdReason = `HOLD 0 ${lot.symbol}. Inside gates. No overnight trade.`;
    const receipt = stampReceipt({
      symbol: lot.symbol,
      ts: tick,
      preview: null,
      risk,
      reason: holdReason,
    });
    holdReceipts.push(receipt);
    cycles.push(
      withReceipt({
        symbol: lot.symbol,
        quote,
        research,
        sentiment,
        risk,
        preview: null,
        receipt,
        ts: tick,
      }),
    );
  }

  const receipts = [
    ...live.map((l) => l.receipt),
    ...blocked.map((l) => l.receipt),
    ...holdReceipts,
  ];
  const impact = impactOf(book, live, ts);
  const bundleHash = bundleReceipts(receipts, ts);

  const names = live.map((l) => `${l.side} ${l.qty} ${l.symbol}`).join(", ");
  const holdN = holdReceipts.length;
  const summary = live.length
    ? `One tap cuts overnight risk: ${names}. ${impact.hoursSaved}h you do not sit. ${impact.feeAvoidedUsdt.toFixed(0)} USDT of panic fees left on the table.`
    : blocked.length
      ? `Every proposed trade is blocked. ${holdN} hold receipt${holdN === 1 ? "" : "s"} still print. Clear the halt or wait for a tighter rToken book.`
      : `Book is inside the gates. ${holdN} hold receipt${holdN === 1 ? "" : "s"} prove the night. NightDesk will watch and stay flat.`;

  return {
    book,
    equityUsdt: equity,
    cashUsdt: account.cashUsdt,
    legs: live,
    blocked,
    impact,
    ts,
    summary,
    receipts,
    cycles,
    bundleHash,
  };
}

export function legLabel(leg: RebalanceLeg): string {
  const inst = getInstrument(leg.symbol);
  return `${leg.side.toUpperCase()} ${leg.qty} ${inst.symbol} (${inst.underlying})`;
}

export function actionLabel(r: ActionReceipt): string {
  if (r.kind === "hold" || r.qty === 0) return `Hold 0 ${r.symbol}`;
  const verb = r.kind === "buy" ? "Buy" : "Sell";
  return `${verb} ${r.qty} ${r.symbol}`;
}
