import { quoteAt } from "./market/quotes";
import { EARNINGS_HOURS, evaluateRisk } from "./risk/engine";
import { runResearch } from "./agents/research";
import { runSentiment } from "./agents/sentiment";
import { detectAnomalies } from "./agents/execution";
import { stampReceipt } from "./agents/receipt";
import { bookToAccount } from "./holdings";
import { impactOf } from "./impact";
import { getInstrument } from "./universe";
import type { ActionReceipt, BookFile, RebalanceLeg, RebalancePlan, Side, SymbolCode } from "./types";

function nameCapQty(equity: number, px: number): number {
  return Math.max(0, Math.floor((equity * 0.12) / px));
}

export function planRebalance(book: BookFile, ts = Date.now(), killSwitch = false): RebalancePlan {
  const account = bookToAccount(book, ts);
  const equity = account.equityUsdt;
  const legs: RebalanceLeg[] = [];

  for (const lot of book.lots) {
    const quote = quoteAt(lot.symbol, ts);
    const px = quote.mid;
    const maxQty = nameCapQty(equity, px);
    const earnings = EARNINGS_HOURS[lot.symbol];
    const inBlackout = earnings !== null && earnings <= 16;
    const research = runResearch(lot.symbol, quote);
    const sentiment = runSentiment(lot.symbol, quote);

    let target = lot.qty;
    const reasons: string[] = [];

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

    const cluster = ["rAAPL", "rNVDA", "rMSFT", "rAMZN"] as SymbolCode[];
    if (cluster.includes(lot.symbol)) {
      const clusterN = book.lots
        .filter((l) => cluster.includes(l.symbol))
        .reduce((s, l) => s + l.qty * (quoteAt(l.symbol, ts).mid), 0);
      if (clusterN > equity * 0.5 && lot.qty === Math.max(...book.lots.filter((l) => cluster.includes(l.symbol)).map((l) => l.qty))) {
        target = Math.min(target, Math.floor(lot.qty * 0.7));
        reasons.push("Mega-cap tech cluster is above 50%. Trim the largest lot.");
      }
    }

    if (target >= lot.qty) continue;
    const qty = lot.qty - target;
    if (qty < 1) continue;

    const side: Side = "sell";
    const risk = evaluateRisk({
      symbol: lot.symbol,
      side,
      qty,
      quote,
      account,
      research,
      sentiment,
      killSwitch,
      earningsHours: EARNINGS_HOURS,
      purpose: "de-risk",
    });
    const previewLike = {
      id: "plan",
      symbol: lot.symbol,
      side,
      qty,
      limitPrice: quote.bid,
      notional: qty * quote.bid,
      status: "preview" as const,
      research,
      sentiment,
      risk,
      anomalies: [] as const,
      previewUntil: ts,
      createdAt: ts,
    };
    const sizedQty = risk.maxQty > 0 ? Math.min(qty, risk.maxQty) : qty;
    const receipt = stampReceipt({
      symbol: lot.symbol,
      ts,
      preview: { ...previewLike, qty: sizedQty, anomalies: [] },
      risk,
      reason: reasons.join(" "),
    });
    legs.push({
      symbol: lot.symbol,
      side,
      qty: sizedQty,
      fromQty: lot.qty,
      toQty: lot.qty - qty,
      purpose: "de-risk",
      reason: reasons.join(" "),
      limitPrice: quote.bid,
      notional: sizedQty * quote.bid,
      risk,
      anomalies: detectAnomalies(quote, { ...previewLike, anomalies: [] }),
      receipt,
    });
  }

  const live = legs.filter((l) => l.risk.verdict !== "block");
  const blocked = legs.filter((l) => l.risk.verdict === "block");
  const touched = new Set(legs.map((l) => l.symbol));
  const holdReceipts: ActionReceipt[] = [];
  for (const lot of book.lots) {
    if (touched.has(lot.symbol)) continue;
    const quote = quoteAt(lot.symbol, ts);
    const research = runResearch(lot.symbol, quote);
    const sentiment = runSentiment(lot.symbol, quote);
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
    holdReceipts.push(
      stampReceipt({
        symbol: lot.symbol,
        ts,
        preview: null,
        risk,
        reason: `HOLD 0 ${lot.symbol}. Inside gates. No overnight trade.`,
      }),
    );
  }
  const receipts = [...live.map((l) => l.receipt), ...blocked.map((l) => l.receipt), ...holdReceipts];
  const impact = impactOf(book, live, ts);

  const names = live.map((l) => `${l.side} ${l.qty} ${l.symbol}`).join(", ");
  const summary = live.length
    ? `One tap cuts overnight risk: ${names}. ${impact.hoursSaved}h you do not sit. ${impact.feeAvoidedUsdt.toFixed(0)} USDT of panic fees left on the table.`
    : blocked.length
      ? "Every proposed leg is blocked. Clear the kill switch or wait for a tighter rToken book."
      : "Book is inside the gates. NightDesk will watch and stay flat.";

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
  };
}

export function legLabel(leg: RebalanceLeg): string {
  const inst = getInstrument(leg.symbol);
  return `${leg.side.toUpperCase()} ${leg.qty} ${inst.symbol} (${inst.underlying})`;
}
