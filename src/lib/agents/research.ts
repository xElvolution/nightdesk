import { getInstrument } from "../universe";
import { hashSeed, mulberry32 } from "../prng";
import type { Bias, Quote, ResearchBrief, SymbolCode } from "../types";

const CATALYSTS: Record<SymbolCode, string[]> = {
  rAAPL: [
    "Services mix still compounding after the cash close",
    "Asia iPhone channel checks into the next session",
    "USD strength versus overnight bid in mega-cap tech",
  ],
  rNVDA: [
    "Data-center bookings chatter into Tokyo open",
    "AI capex prints still bid after-hours rToken tape",
    "Supply tightness in high-end GPUs into next cash open",
  ],
  rTSLA: [
    "Delivery-run rate into quarter end",
    "China insurance registrations overnight",
    "Autonomy headline risk while cash is shut",
  ],
  rMSFT: [
    "Azure run-rate versus guidance into Europe open",
    "OpenAI partnership flow in after-hours news",
    "Buyback dry powder on any overnight dip",
  ],
  rAMZN: [
    "AWS residual strength after the US print",
    "Prime logistics headlines from EU morning shows",
    "Retail margin mix into the next cash session",
  ],
};

const RISKS: Record<SymbolCode, string[]> = {
  rAAPL: ["China demand miss", "Services tax headlines", "Index rebalance flow"],
  rNVDA: ["Export-control addendum", "Customer capex pause", "Crowded long squeeze"],
  rTSLA: ["Price-cut rumor", "Regulatory probe", "Gap through 250"],
  rMSFT: ["Cloud growth deceleration", "Antitrust headline", "Rate-sensitive multiple"],
  rAMZN: ["AWS deceleration", "Labor action", "FX translation"],
};

export function runResearch(symbol: SymbolCode, quote: Quote): ResearchBrief {
  const inst = getInstrument(symbol);
  const rand = mulberry32(hashSeed(`research:${symbol}:${Math.floor(quote.ts / 15_000)}`));
  const drift = quote.changePct;
  let bias: Bias = "flat";
  if (drift > 0.18 && rand() > 0.35) bias = "long";
  else if (drift < -0.18 && rand() > 0.35) bias = "short";
  else if (Math.abs(drift) > 0.55) bias = drift > 0 ? "short" : "long";
  const confidence = Math.min(0.92, 0.38 + Math.abs(drift) * 0.35 + rand() * 0.22);
  const cats = CATALYSTS[symbol].filter(() => rand() > 0.33);
  const risks = RISKS[symbol].filter(() => rand() > 0.4);
  const thesis =
    bias === "flat"
      ? `${inst.name} overnight drift is ${drift.toFixed(2)}%. Research stays flat until the tape chooses a side.`
      : `${inst.name} ${bias} into the next cash open. Overnight rToken last ${quote.last.toFixed(2)}, cash session is ${quote.session === "us-cash-open" ? "open" : "closed"}. Edge is the gap, not the tick.`;

  return {
    symbol,
    bias,
    confidence: Number(confidence.toFixed(2)),
    horizonHours: bias === "flat" ? 0 : 12 + Math.floor(rand() * 6),
    thesis,
    catalysts: cats.length ? cats : [CATALYSTS[symbol][0]],
    risks: risks.length ? risks : [RISKS[symbol][0]],
    ts: quote.ts,
  };
}
