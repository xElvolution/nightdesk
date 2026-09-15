import { FEE_BPS, PREVIEW_MS } from "../universe";
import { fnv1a } from "../hash";
import type {
  AnomalyCode,
  OrderPreview,
  Quote,
  ResearchBrief,
  RiskDecision,
  SentimentPrint,
  Side,
} from "../types";

export function intendedSide(research: ResearchBrief, sentiment: SentimentPrint): Side | null {
  if (research.bias === "flat") return null;
  const sentSide: Side | null =
    sentiment.score >= 18 ? "buy" : sentiment.score <= -18 ? "sell" : null;
  if (!sentSide) return null;
  if (research.bias === "long" && sentSide === "buy") return "buy";
  if (research.bias === "short" && sentSide === "sell") return "sell";
  return null;
}

export function sizeOrder(
  equity: number,
  confidence: number,
  px: number,
  maxQty: number,
): number {
  const raw = Math.floor(((equity * 0.06 * confidence) / px) * 100) / 100;
  const qty = Math.max(1, Math.floor(raw));
  if (maxQty <= 0) return qty;
  return Math.min(qty, maxQty);
}

export function stagePreview(args: {
  quote: Quote;
  research: ResearchBrief;
  sentiment: SentimentPrint;
  risk: RiskDecision;
  side: Side;
  qty: number;
}): OrderPreview {
  const { quote, research, sentiment, risk, side, qty } = args;
  const limitPrice = side === "buy" ? quote.ask : quote.bid;
  const id = `nd_${fnv1a(`${quote.symbol}:${quote.ts}:${side}:${qty}`)}`;
  return {
    id,
    symbol: quote.symbol,
    side,
    qty,
    limitPrice,
    notional: qty * limitPrice,
    status: risk.verdict === "block" ? "rejected" : "preview",
    research,
    sentiment,
    risk,
    anomalies: [],
    previewUntil: quote.ts + PREVIEW_MS,
    createdAt: quote.ts,
  };
}

export function detectAnomalies(quote: Quote, preview: OrderPreview): AnomalyCode[] {
  const hits: AnomalyCode[] = [];
  if (quote.spreadBps > 18) hits.push("spread_blowout");
  if (quote.staleMs > 4_000) hits.push("quote_stale");
  const flip = Math.abs(preview.sentiment.score - preview.sentiment.priorScore);
  if (flip > 40) hits.push("sentiment_flip");
  if (Math.abs(quote.changePct) > 1.8) hits.push("vol_spike");
  if (quote.last <= 0) hits.push("circuit_break");
  if (preview.risk.verdict === "block") hits.push("rule_block");
  return hits;
}

export function feeOn(notional: number): number {
  return (notional * FEE_BPS) / 10_000;
}
