import { getInstrument, STARTING_CASH } from "../universe";
import { RISK_RULES } from "./rules";
import type {
  PaperAccount,
  Quote,
  ResearchBrief,
  RiskDecision,
  RuleResult,
  SentimentPrint,
  Side,
  SymbolCode,
} from "../types";

export interface RiskInput {
  symbol: SymbolCode;
  side: Side;
  qty: number;
  quote: Quote;
  account: PaperAccount;
  research: ResearchBrief;
  sentiment: SentimentPrint;
  killSwitch: boolean;
  earningsHours: Record<SymbolCode, number | null>;
  purpose?: "de-risk" | "alpha";
}

function rule(
  id: string,
  passed: boolean,
  message: string,
  metric?: string,
): RuleResult {
  const def = RISK_RULES.find((r) => r.id === id)!;
  return { id, name: def.name, severity: def.severity, passed, message, metric };
}

function notional(qty: number, px: number): number {
  return Math.abs(qty) * px;
}

export function evaluateRisk(input: RiskInput): RiskDecision {
  const { symbol, side, qty, quote, account, research, sentiment, killSwitch } = input;
  const purpose = input.purpose ?? "alpha";
  const inst = getInstrument(symbol);
  const px = quote.mid;
  const orderN = notional(qty, px);
  const signedQty = side === "buy" ? qty : -qty;
  const existing = account.positions.find((p) => p.symbol === symbol);
  const newQty = (existing?.qty ?? 0) + signedQty;
  const nameN = Math.abs(newQty) * px;

  const clusterSymbols = new Set(["rAAPL", "rNVDA", "rMSFT", "rAMZN"]);
  let cluster = 0;
  let gross = 0;
  for (const p of account.positions) {
    const q = p.symbol === symbol ? newQty : p.qty;
    const n = Math.abs(q) * (p.symbol === symbol ? px : p.avgPrice);
    gross += n;
    if (clusterSymbols.has(p.symbol) || (p.symbol === symbol && clusterSymbols.has(symbol))) {
      if (clusterSymbols.has(p.symbol === symbol ? symbol : p.symbol)) cluster += n;
    }
  }
  if (!account.positions.some((p) => p.symbol === symbol)) {
    gross += nameN;
    if (clusterSymbols.has(symbol)) cluster += nameN;
  }

  const earnings = input.earningsHours[symbol];
  const sentFlip = Math.abs(sentiment.score - sentiment.priorScore);

  const results: RuleResult[] = [
    rule(
      "R01_MAX_NAME",
      nameN <= account.equityUsdt * 0.12,
      nameN <= account.equityUsdt * 0.12
        ? "Name notional inside 12% of equity."
        : "Name notional would exceed 12% of equity.",
      `${((nameN / account.equityUsdt) * 100).toFixed(1)}%`,
    ),
    rule(
      "R02_GROSS",
      gross <= account.equityUsdt * 0.8,
      gross <= account.equityUsdt * 0.8
        ? "Gross book inside 80% of equity."
        : "Gross book would exceed 80% of equity.",
      `${((gross / account.equityUsdt) * 100).toFixed(1)}%`,
    ),
    rule(
      "R03_CLUSTER",
      cluster <= account.equityUsdt * 0.5,
      cluster <= account.equityUsdt * 0.5
        ? "Mega-cap tech cluster inside 50%."
        : "Mega-cap tech cluster would exceed 50%.",
      `${((cluster / account.equityUsdt) * 100).toFixed(1)}%`,
    ),
    rule(
      "R04_SPREAD",
      quote.spreadBps <= 18,
      quote.spreadBps <= 18
        ? "Spread inside the 18 bps anomaly band."
        : "Spread wider than 18 bps. Cancel-on-anomaly.",
      `${quote.spreadBps.toFixed(1)} bps`,
    ),
    rule(
      "R05_STALE",
      quote.staleMs <= 4_000,
      quote.staleMs <= 4_000
        ? "Quote is fresh."
        : "Quote is stale. Execution will not arm.",
      `${quote.staleMs} ms`,
    ),
    rule(
      "R06_DAY_LOSS",
      account.dayPnl >= -STARTING_CASH * 0.025,
      account.dayPnl >= -STARTING_CASH * 0.025
        ? "Session loss inside the halt."
        : "Daily loss halt is on. No new risk.",
      `${((account.dayPnl / STARTING_CASH) * 100).toFixed(2)}%`,
    ),
    rule(
      "R07_DRAWDOWN",
      account.drawdownPct <= 6,
      account.drawdownPct <= 6
        ? "Drawdown inside the 6% brake."
        : "Drawdown brake is on.",
      `${account.drawdownPct.toFixed(2)}%`,
    ),
    rule(
      "R08_EARNINGS",
      (() => {
        const inWindow = earnings !== null && earnings <= 16;
        if (!inWindow) return true;
        const existingQty = existing?.qty ?? 0;
        const reducing = Math.abs(newQty) < Math.abs(existingQty);
        return reducing;
      })(),
      (() => {
        const inWindow = earnings !== null && earnings <= 16;
        if (!inWindow) return "Outside the earnings blackout.";
        const existingQty = existing?.qty ?? 0;
        const reducing = Math.abs(newQty) < Math.abs(existingQty);
        return reducing
          ? `Earnings in ${earnings?.toFixed(1)}h. Reducing is allowed. Adding is not.`
          : `Earnings in ${earnings?.toFixed(1)}h. Blackout blocks new risk.`;
      })(),
      earnings === null ? "none" : `${earnings.toFixed(1)}h`,
    ),
    rule(
      "R09_SENTIMENT",
      sentFlip <= 40,
      sentFlip <= 40
        ? "Sentiment is stable versus the prior print."
        : "Sentiment flipped more than 40 points. Size will be cut.",
      `${sentFlip.toFixed(0)} pts`,
    ),
    rule(
      "R10_ADV",
      orderN <= inst.avgDailyNotionalUsdt * 0.015,
      orderN <= inst.avgDailyNotionalUsdt * 0.015
        ? "Participation inside 1.5% of ADV."
        : "Order is too large versus rToken ADV.",
      `${((orderN / inst.avgDailyNotionalUsdt) * 100).toFixed(3)}%`,
    ),
    rule(
      "R11_CONVICTION",
      purpose === "de-risk" || (research.confidence >= 0.42 && Math.abs(sentiment.score) >= 18),
      purpose === "de-risk"
        ? "De-risk leg. Conviction floor does not apply."
        : research.confidence >= 0.42 && Math.abs(sentiment.score) >= 18
          ? "Conviction clears the floor."
          : "Conviction is too low. Desk stays flat.",
      purpose === "de-risk"
        ? "de-risk"
        : `conf ${research.confidence.toFixed(2)} / sent ${sentiment.score.toFixed(0)}`,
    ),
    rule(
      "R12_KILL",
      !killSwitch,
      killSwitch ? "Kill switch is on. Every order is rejected." : "Kill switch is off.",
      killSwitch ? "ON" : "OFF",
    ),
  ];

  const blocked = results.filter((r) => !r.passed && r.severity === "block");
  const warned = results.filter((r) => !r.passed && r.severity === "warn");
  let maxQty = qty;
  if (warned.length) maxQty = Math.max(1, Math.floor(qty * 0.5));
  if (blocked.length) maxQty = 0;

  const verdict = blocked.length ? "block" : warned.length ? "warn" : "pass";
  const notes: string[] = [];
  if (quote.session === "us-cash-closed") {
    notes.push("US cash session is closed. This is an rToken overnight ticket from Lagos.");
  }
  if (purpose === "de-risk") notes.push("Purpose is de-risk, not alpha.");
  if (verdict === "block") notes.push("Execution stays in preview until the block clears.");
  if (verdict === "warn") notes.push("Size cut 50% on sentiment reversal.");

  return { verdict, results, maxQty, notes, ts: quote.ts };
}

export const EARNINGS_HOURS: Record<SymbolCode, number | null> = {
  rAAPL: 96,
  rNVDA: 42,
  rTSLA: 8.5,
  rMSFT: 120,
  rAMZN: 54,
};
