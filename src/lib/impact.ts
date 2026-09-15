import { FEE_BPS } from "./universe";
import { history } from "./market/history";
import { overnightHours } from "./clock";
import type { BookFile, ImpactNumbers, RebalanceLeg } from "./types";
import { bookQuotes } from "./market/quotes";

export function impactOf(book: BookFile, legs: RebalanceLeg[], ts = Date.now()): ImpactNumbers {
  const quotes = bookQuotes(ts);
  const qmap = new Map(quotes.map((q) => [q.symbol, q]));
  let bookNotional = 0;
  let gapUsdt = 0;
  let namesAtRisk = 0;

  for (const lot of book.lots) {
    const px = qmap.get(lot.symbol)?.mid ?? lot.avgPrice;
    const n = Math.abs(lot.qty) * px;
    bookNotional += n;
    const bars = history(lot.symbol, 90);
    const last = bars[bars.length - 1];
    const gap = Math.abs(last?.overnightRet ?? 0);
    gapUsdt += n * gap;
    if (gap >= 0.008) namesAtRisk += 1;
  }

  const overnightGapPct = bookNotional > 0 ? (gapUsdt / bookNotional) * 100 : 0;
  const panicFeeUsdt = (bookNotional * FEE_BPS * 2 * 3) / 10_000;
  const gatedNotional = legs.reduce((s, l) => s + l.notional, 0);
  const gatedFeeUsdt = (gatedNotional * FEE_BPS) / 10_000;
  const feeAvoidedUsdt = Math.max(0, panicFeeUsdt - gatedFeeUsdt);

  return {
    hoursSaved: overnightHours(),
    lagosWatch: "21:00 Lagos to 14:30 Lagos (US cash close to next open)",
    feeAvoidedUsdt: Number(feeAvoidedUsdt.toFixed(2)),
    panicFeeUsdt: Number(panicFeeUsdt.toFixed(2)),
    gatedFeeUsdt: Number(gatedFeeUsdt.toFixed(2)),
    overnightGapPct: Number(overnightGapPct.toFixed(2)),
    overnightGapUsdt: Number(gapUsdt.toFixed(2)),
    namesAtRisk,
    roundTripsAvoided: 3,
  };
}
