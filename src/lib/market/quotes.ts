import { BASE_PRICES, getInstrument } from "../universe";
import { sessionLabel } from "../clock";
import { gaussian, hashSeed, mulberry32 } from "../prng";
import type { Quote, SymbolCode } from "../types";

const VOL: Record<SymbolCode, number> = {
  rAAPL: 0.012,
  rNVDA: 0.022,
  rTSLA: 0.028,
  rMSFT: 0.013,
  rAMZN: 0.016,
};

export function quoteAt(symbol: SymbolCode, ts: number): Quote {
  const inst = getInstrument(symbol);
  const seed = hashSeed(`${symbol}:${Math.floor(ts / 1200)}`);
  const rand = mulberry32(seed);
  const hourBump = Math.sin(ts / 3_600_000 + seed) * 0.0015;
  const shock = gaussian(rand) * VOL[symbol] * 0.08;
  const last = round(BASE_PRICES[symbol] * (1 + hourBump + shock), inst.tick);
  const session = sessionLabel(ts);
  const wide = session === "us-cash-closed" ? 1.8 : 1.0;
  const spread = (2 + rand() * 6) * wide * inst.tick;
  const mid = last;
  const bid = round(mid - spread / 2, inst.tick);
  const ask = round(mid + spread / 2, inst.tick);
  const spreadBps = ((ask - bid) / mid) * 10_000;
  const changePct = (hourBump + shock) * 100;
  const volume = Math.floor(inst.avgDailyNotionalUsdt * (0.0004 + rand() * 0.0008));
  const staleMs = Math.floor(rand() * 900);
  return {
    symbol,
    bid,
    ask,
    last,
    mid,
    spreadBps,
    changePct,
    volume,
    ts,
    session,
    staleMs,
  };
}

export function bookQuotes(ts: number): Quote[] {
  return (Object.keys(BASE_PRICES) as SymbolCode[]).map((s) => quoteAt(s, ts));
}

export function round(n: number, tick: number): number {
  return Math.round(n / tick) * tick;
}
