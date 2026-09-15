import type { RuleSeverity } from "../types";

export interface RiskRuleDef {
  id: string;
  name: string;
  severity: RuleSeverity;
  summary: string;
  limit: string;
  why: string;
}

export const RISK_RULES: RiskRuleDef[] = [
  {
    id: "R01_MAX_NAME",
    name: "Max name notional",
    severity: "block",
    summary: "Single rToken cannot exceed 12% of equity.",
    limit: "12% of equity",
    why: "Overnight books on tokenized names gap. One name cannot sink the desk.",
  },
  {
    id: "R02_GROSS",
    name: "Gross exposure cap",
    severity: "block",
    summary: "Sum of absolute position notionals cannot exceed 80% of equity.",
    limit: "80% of equity",
    why: "Paper capital has to survive a correlated tech selloff after the US cash close.",
  },
  {
    id: "R03_CLUSTER",
    name: "Mega-cap tech cluster",
    severity: "block",
    summary: "Combined rAAPL + rNVDA + rMSFT + rAMZN cannot exceed 50% of equity.",
    limit: "50% of equity",
    why: "Those four print as one factor after hours. Cluster risk is the real overnight book.",
  },
  {
    id: "R04_SPREAD",
    name: "Spread anomaly",
    severity: "block",
    summary: "Cancel or reject if bid/ask spread is wider than 18 bps.",
    limit: "18 bps",
    why: "Wide rToken spreads after the cash close are a liquidity warning, not an edge.",
  },
  {
    id: "R05_STALE",
    name: "Quote freshness",
    severity: "block",
    summary: "Cancel if the quote is older than 4 seconds.",
    limit: "4,000 ms",
    why: "Stale mids fill at yesterday. Execution only arms on a live book.",
  },
  {
    id: "R06_DAY_LOSS",
    name: "Daily loss halt",
    severity: "block",
    summary: "Halt new risk if session PnL is worse than -2.5% of starting cash.",
    limit: "-2.5%",
    why: "A losing overnight book does not average down. The desk goes flat.",
  },
  {
    id: "R07_DRAWDOWN",
    name: "Drawdown brake",
    severity: "block",
    summary: "Halt if equity is 6% below the high-water mark.",
    limit: "6% from high water",
    why: "Path risk matters more than one trade. The brake is mechanical.",
  },
  {
    id: "R08_EARNINGS",
    name: "Earnings blackout",
    severity: "block",
    summary: "No new risk in a name inside 16 hours of scheduled earnings. Reducing is allowed.",
    limit: "16 hour window",
    why: "rTokens reprice through the print. The desk does not guess the number. Cutting is a risk action.",
  },
  {
    id: "R09_SENTIMENT",
    name: "Sentiment reversal",
    severity: "warn",
    summary: "Warn and cut size if sentiment flips more than 40 points versus the brief.",
    limit: "40 point flip",
    why: "A flip after the cash close is usually flow, not a new thesis.",
  },
  {
    id: "R10_ADV",
    name: "ADV participation",
    severity: "block",
    summary: "Order notional cannot exceed 1.5% of average daily rToken notional.",
    limit: "1.5% of ADV",
    why: "The paper book should be fillable on a real Bitget rToken tape.",
  },
  {
    id: "R11_CONVICTION",
    name: "Conviction floor",
    severity: "block",
    summary: "Research confidence must be at least 0.42 and sentiment |score| at least 18.",
    limit: "conf >= 0.42, |sent| >= 18",
    why: "Flat is a position. Low-conviction overnight trades are noise.",
  },
  {
    id: "R12_KILL",
    name: "Kill switch",
    severity: "block",
    summary: "Operator kill switch rejects every new order immediately.",
    limit: "boolean",
    why: "A human still owns the desk. One switch stops the agents.",
  },
];
