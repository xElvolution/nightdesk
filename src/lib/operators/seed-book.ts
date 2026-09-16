import { appendAudit } from "../audit/log";
import { bookQuotes } from "../market/quotes";
import { applyFill, makeFill, markAccount } from "../paper/account";
import { bookToAccount } from "../holdings";
import { parseHoldingsCsv } from "../holdings";
import type { AuditEvent, BookFile, Fill, PaperAccount, SymbolCode } from "../types";
import type { Operator } from "./types";
import type { LedgerState } from "../ledger/store";

const OVERNIGHT_CSV = `symbol,qty,avg_price,note
rNVDA,85,162.40,core AI book
rAAPL,40,214.10,cash-flow ballast
rTSLA,55,238.00,trimmed into the print
rMSFT,18,401.20,cloud sleeve
rAMZN,22,186.50,AWS exposure
USDT,12400,1.00,cash sleeve
`;

function hoursAgo(h: number, now: number): number {
  return now - h * 60 * 60 * 1000;
}

function minutesAgo(m: number, now: number): number {
  return now - m * 60 * 1000;
}

/** Seed a lived-in overnight book for a new operator (Lagos/WAT overnight context). */
export function seedOvernightBook(operator: Operator, now = Date.now()): LedgerState {
  const book: BookFile = {
    ...parseHoldingsCsv(OVERNIGHT_CSV, `${operator.handle}.overnight.csv`),
    source: "csv",
    name: `${operator.handle}.overnight.csv`,
  };

  const audit: AuditEvent[] = [];
  const fills: Fill[] = [];

  appendAudit(audit, {
    ts: hoursAgo(9.5, now),
    actor: "system",
    action: "desk.open",
    detail: `NightDesk opened for @${operator.handle}. Universe: rAAPL rNVDA rTSLA rMSFT rAMZN · USDT sleeve.`,
  });
  appendAudit(audit, {
    ts: hoursAgo(9.2, now),
    actor: "operator",
    action: "book.import",
    detail: `Imported Bitget overnight book · 5 rToken lots · 12,400 USDT cash.`,
  });

  // Research / sentiment prints through the night
  const research: { symbol: SymbolCode; thesis: string; at: number }[] = [
    {
      symbol: "rNVDA",
      thesis: "Bias long · conviction 0.72 · horizon 14h. AI tape holding after cash close; size into dips under 165.",
      at: hoursAgo(8.6, now),
    },
    {
      symbol: "rTSLA",
      thesis: "Bias short · conviction 0.61 · horizon 10h. Post-print residual vol; trim into strength above 242.",
      at: hoursAgo(8.1, now),
    },
    {
      symbol: "rAAPL",
      thesis: "Bias flat · conviction 0.48 · horizon 12h. Cash-flow ballast; hold through the gap.",
      at: hoursAgo(7.4, now),
    },
    {
      symbol: "rMSFT",
      thesis: "Bias long · conviction 0.66 · horizon 16h. Cloud sleeve quiet; add only on aligned sentiment.",
      at: hoursAgo(6.2, now),
    },
    {
      symbol: "rAMZN",
      thesis: "Bias long · conviction 0.55 · horizon 11h. AWS narrative intact; keep sleeve under name cap.",
      at: hoursAgo(5.5, now),
    },
  ];

  for (const r of research) {
    appendAudit(audit, {
      ts: r.at,
      actor: "research",
      action: "brief",
      symbol: r.symbol,
      detail: r.thesis,
    });
  }

  appendAudit(audit, {
    ts: hoursAgo(7.9, now),
    actor: "sentiment",
    action: "print",
    symbol: "rNVDA",
    detail: "Score 0.64 (warm). Drivers: AI flow +0.28, options skew +0.14, social heat +0.11.",
  });
  appendAudit(audit, {
    ts: hoursAgo(7.7, now),
    actor: "sentiment",
    action: "print",
    symbol: "rTSLA",
    detail: "Score -0.22 (cold). Drivers: delivery chatter -0.18, vol spike -0.12.",
  });
  appendAudit(audit, {
    ts: hoursAgo(6.8, now),
    actor: "risk",
    action: "gate",
    symbol: "rTSLA",
    detail: "Verdict warn. Name weight 11.4% near 12% cap. Reduce allowed; add blocked.",
  });
  appendAudit(audit, {
    ts: hoursAgo(6.5, now),
    actor: "risk",
    action: "gate",
    symbol: "rNVDA",
    detail: "Verdict pass. Gross 71% · mega-cap tech cluster 48% · spread 6.2 bps.",
  });

  // Overnight fills already on the blotter
  let account: PaperAccount = bookToAccount(book, hoursAgo(9, now));
  const fillSpecs: {
    symbol: SymbolCode;
    side: "buy" | "sell";
    qty: number;
    price: number;
    ts: number;
    note: string;
  }[] = [
    {
      symbol: "rTSLA",
      side: "sell",
      qty: 12,
      price: 241.8,
      ts: hoursAgo(6.3, now),
      note: "De-risk into print residual. Receipt chain closed.",
    },
    {
      symbol: "rNVDA",
      side: "buy",
      qty: 8,
      price: 161.55,
      ts: hoursAgo(4.1, now),
      note: "Aligned research + sentiment. Size under ADV cap.",
    },
    {
      symbol: "rMSFT",
      side: "buy",
      qty: 3,
      price: 399.4,
      ts: hoursAgo(2.6, now),
      note: "Cloud sleeve top-up after risk pass.",
    },
  ];

  for (const spec of fillSpecs) {
    const fill = makeFill({
      orderId: `seed_${spec.symbol}_${spec.ts}`,
      symbol: spec.symbol,
      side: spec.side,
      qty: spec.qty,
      price: spec.price,
      ts: spec.ts,
    });
    account = applyFill(account, fill);
    fills.push(fill);
    appendAudit(audit, {
      ts: spec.ts,
      actor: "execution",
      action: "fill",
      symbol: spec.symbol,
      detail: `${fill.side} ${fill.qty} ${fill.symbol} @ ${fill.price.toFixed(2)} · fee ${fill.feeUsdt.toFixed(2)} USDT · ${spec.note}`,
    });

    // Mirror fill into book lots / cash
    const lot = book.lots.find((l) => l.symbol === spec.symbol);
    if (lot) {
      if (spec.side === "sell") lot.qty = Math.max(0, lot.qty - spec.qty);
      else {
        const nextQty = lot.qty + spec.qty;
        lot.avgPrice = (lot.avgPrice * lot.qty + spec.price * spec.qty) / nextQty;
        lot.qty = nextQty;
      }
    }
    const notional = spec.qty * spec.price;
    const fee = fill.feeUsdt;
    if (spec.side === "buy") book.cashUsdt -= notional + fee;
    else book.cashUsdt += notional - fee;
  }

  book.lots = book.lots.filter((l) => l.qty !== 0);
  book.cashUsdt = Math.max(0, Number(book.cashUsdt.toFixed(2)));

  appendAudit(audit, {
    ts: hoursAgo(2.4, now),
    actor: "execution",
    action: "receipt",
    symbol: "rMSFT",
    detail: "BUY 3 · risk pass · cancel-on-anomaly clear · ledger updated.",
  });
  appendAudit(audit, {
    ts: minutesAgo(18, now),
    actor: "system",
    action: "desk.resume",
    detail: `Operator @${operator.handle} (${operator.displayName}) resumed the overnight book. Session cookie bound.`,
  });
  appendAudit(audit, {
    ts: minutesAgo(3, now),
    actor: "risk",
    action: "gate",
    detail: "Desk health check. Kill switch off. Venue feed live or recorded failover ready.",
  });

  account = markAccount(account, bookQuotes(now));
  // Keep cash/positions consistent with mutated book
  account = markAccount(bookToAccount(book, now), bookQuotes(now));

  return {
    book,
    fills: fills.slice().reverse(),
    audit,
    account,
    updatedAt: now,
  };
}

