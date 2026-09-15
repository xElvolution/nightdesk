export type Side = "buy" | "sell";
export type Bias = "long" | "short" | "flat";
export type AgentId = "research" | "sentiment" | "risk" | "execution";
export type AgentStatus = "idle" | "running" | "ready" | "blocked";
export type RuleSeverity = "info" | "warn" | "block";
export type OrderStatus =
  | "preview"
  | "armed"
  | "filled"
  | "cancelled"
  | "rejected";
export type AnomalyCode =
  | "spread_blowout"
  | "quote_stale"
  | "sentiment_flip"
  | "vol_spike"
  | "circuit_break"
  | "rule_block"
  | "kill_switch"
  | "operator_cancel";

export type SymbolCode = "rAAPL" | "rNVDA" | "rTSLA" | "rMSFT" | "rAMZN";

export interface Instrument {
  symbol: SymbolCode;
  underlying: "AAPL" | "NVDA" | "TSLA" | "MSFT" | "AMZN";
  name: string;
  sector: "Technology" | "Consumer" | "Automotive";
  cluster: "mega-cap-tech" | "auto-ev";
  tick: number;
  lot: number;
  avgDailyNotionalUsdt: number;
}

export interface Quote {
  symbol: SymbolCode;
  bid: number;
  ask: number;
  last: number;
  mid: number;
  spreadBps: number;
  changePct: number;
  volume: number;
  ts: number;
  session: "us-cash-open" | "us-cash-closed";
  staleMs: number;
}

export interface ResearchBrief {
  symbol: SymbolCode;
  bias: Bias;
  confidence: number;
  horizonHours: number;
  thesis: string;
  catalysts: string[];
  risks: string[];
  ts: number;
}

export interface SentimentPrint {
  symbol: SymbolCode;
  score: number;
  priorScore: number;
  drivers: { label: string; weight: number }[];
  heat: "cold" | "warm" | "hot";
  ts: number;
}

export interface RuleResult {
  id: string;
  name: string;
  severity: RuleSeverity;
  passed: boolean;
  message: string;
  metric?: string;
}

export interface RiskDecision {
  verdict: "pass" | "warn" | "block";
  results: RuleResult[];
  maxQty: number;
  notes: string[];
  ts: number;
}

export interface OrderPreview {
  id: string;
  symbol: SymbolCode;
  side: Side;
  qty: number;
  limitPrice: number;
  notional: number;
  status: OrderStatus;
  research: ResearchBrief;
  sentiment: SentimentPrint;
  risk: RiskDecision;
  anomalies: AnomalyCode[];
  previewUntil: number;
  createdAt: number;
}

export interface Fill {
  id: string;
  orderId: string;
  symbol: SymbolCode;
  side: Side;
  qty: number;
  price: number;
  notional: number;
  feeUsdt: number;
  ts: number;
}

export interface Position {
  symbol: SymbolCode;
  qty: number;
  avgPrice: number;
  marketValue: number;
  unrealizedPnl: number;
}

export interface PaperAccount {
  cashUsdt: number;
  equityUsdt: number;
  realizedPnl: number;
  unrealizedPnl: number;
  startingCash: number;
  positions: Position[];
  dayPnl: number;
  highWater: number;
  drawdownPct: number;
}

export interface AuditEvent {
  id: string;
  ts: number;
  actor: AgentId | "operator" | "system";
  action: string;
  symbol?: SymbolCode;
  detail: string;
  payload?: Record<string, unknown>;
  hash: string;
  prevHash: string;
}

export interface BacktestTrade {
  session: string;
  symbol: SymbolCode;
  side: Side;
  qty: number;
  entry: number;
  exit: number;
  pnl: number;
  holdHours: number;
  cancelled: boolean;
  cancelReason?: AnomalyCode;
}

export interface BacktestReport {
  id: string;
  strategy: string;
  from: string;
  to: string;
  startingCash: number;
  endingEquity: number;
  pnl: number;
  pnlPct: number;
  trades: number;
  wins: number;
  losses: number;
  winRate: number;
  maxDrawdownPct: number;
  sharpe: number;
  cancelRate: number;
  exposureHours: number;
  curve: { t: string; equity: number }[];
  tradesList: BacktestTrade[];
  notes: string[];
}

export interface ActionReceipt {
  id: string;
  hash: string;
  ts: number;
  symbol: SymbolCode;
  kind: Side | "hold";
  qty: number;
  limitPrice: number;
  notional: number;
  status: "hold" | "preview" | "filled" | "cancelled" | "rejected";
  reason: string;
  agents: AgentId[];
  riskVerdict: "pass" | "warn" | "block";
}

export interface DeskCycle {
  symbol: SymbolCode;
  quote: Quote;
  research: ResearchBrief;
  sentiment: SentimentPrint;
  risk: RiskDecision;
  preview: OrderPreview | null;
  receipt: ActionReceipt;
  ts: number;
}

export interface HoldingLot {
  symbol: SymbolCode;
  qty: number;
  avgPrice: number;
  note?: string;
}

export interface BookFile {
  name: string;
  cashUsdt: number;
  lots: HoldingLot[];
  source: "template" | "csv";
  raw?: string;
}

export type LegPurpose = "de-risk" | "alpha";

export interface RebalanceLeg {
  symbol: SymbolCode;
  side: Side;
  qty: number;
  fromQty: number;
  toQty: number;
  purpose: LegPurpose;
  reason: string;
  limitPrice: number;
  notional: number;
  risk: RiskDecision;
  anomalies: AnomalyCode[];
  receipt: ActionReceipt;
}

export interface ImpactNumbers {
  hoursSaved: number;
  lagosWatch: string;
  feeAvoidedUsdt: number;
  panicFeeUsdt: number;
  gatedFeeUsdt: number;
  overnightGapPct: number;
  overnightGapUsdt: number;
  namesAtRisk: number;
  roundTripsAvoided: number;
}

export interface RebalancePlan {
  book: BookFile;
  equityUsdt: number;
  cashUsdt: number;
  legs: RebalanceLeg[];
  blocked: RebalanceLeg[];
  impact: ImpactNumbers;
  ts: number;
  summary: string;
  receipts: ActionReceipt[];
}
