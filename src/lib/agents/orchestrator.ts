import { quoteAt } from "../market/quotes";
import { EARNINGS_HOURS, evaluateRisk } from "../risk/engine";
import { emptyAccount } from "../paper/account";
import { runResearch } from "./research";
import { runSentiment } from "./sentiment";
import { intendedSide, sizeOrder, stagePreview } from "./execution";
import { withReceipt } from "./receipt";
import type { DeskCycle, PaperAccount, SymbolCode } from "../types";

export function runCycle(
  symbol: SymbolCode,
  ts: number,
  account: PaperAccount = emptyAccount(),
  killSwitch = false,
): DeskCycle {
  const quote = quoteAt(symbol, ts);
  const research = runResearch(symbol, quote);
  const sentiment = runSentiment(symbol, quote);
  const side = intendedSide(research, sentiment);
  const qtyGuess = sizeOrder(account.equityUsdt, research.confidence, quote.mid, 1_000_000);
  const risk = evaluateRisk({
    symbol,
    side: side ?? "buy",
    qty: Math.max(qtyGuess, 1),
    quote,
    account,
    research,
    sentiment,
    killSwitch,
    earningsHours: EARNINGS_HOURS,
    purpose: "alpha",
  });

  if (!side || risk.verdict === "block") {
    return withReceipt({
      symbol,
      quote,
      research,
      sentiment,
      risk,
      preview: null,
      ts,
    });
  }

  const qty = sizeOrder(account.equityUsdt, research.confidence, quote.mid, risk.maxQty || qtyGuess);
  const preview = stagePreview({ quote, research, sentiment, risk, side, qty });
  return withReceipt({ symbol, quote, research, sentiment, risk, preview, ts });
}

export function runDesk(symbols: SymbolCode[], ts: number, account?: PaperAccount, killSwitch = false) {
  return symbols.map((s, i) => runCycle(s, ts + i, account, killSwitch));
}
