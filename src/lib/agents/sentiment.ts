import { hashSeed, mulberry32 } from "../prng";
import type { Quote, SentimentPrint, SymbolCode } from "../types";

const DRIVERS = [
  "After-hours headline heat",
  "rToken tape aggression",
  "Options skew into cash open",
  "Social volume vs 20-day",
  "Futures lead vs spot",
  "Funding / borrow chatter",
];

export function runSentiment(symbol: SymbolCode, quote: Quote): SentimentPrint {
  const bucket = Math.floor(quote.ts / 12_000);
  const rand = mulberry32(hashSeed(`sent:${symbol}:${bucket}`));
  const priorRand = mulberry32(hashSeed(`sent:${symbol}:${bucket - 1}`));
  const score = clamp(quote.changePct * 18 + (rand() - 0.5) * 70, -100, 100);
  const priorScore = clamp(quote.changePct * 14 + (priorRand() - 0.5) * 70, -100, 100);
  const drivers = DRIVERS.map((label) => ({
    label,
    weight: Number(((rand() - 0.5) * 2).toFixed(2)),
  })).sort((a, b) => Math.abs(b.weight) - Math.abs(a.weight)).slice(0, 4);
  const abs = Math.abs(score);
  const heat = abs > 55 ? "hot" : abs > 25 ? "warm" : "cold";
  return {
    symbol,
    score: Number(score.toFixed(1)),
    priorScore: Number(priorScore.toFixed(1)),
    drivers,
    heat,
    ts: quote.ts,
  };
}

function clamp(n: number, a: number, b: number): number {
  return Math.max(a, Math.min(b, n));
}
