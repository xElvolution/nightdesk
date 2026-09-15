import { BASE_PRICES, getInstrument } from "../universe";
import { gaussian, hashSeed, mulberry32 } from "../prng";
import type { SymbolCode } from "../types";

export interface Bar {
  t: string;
  open: number;
  high: number;
  low: number;
  close: number;
  overnightRet: number;
}

const DAILY_VOL: Record<SymbolCode, number> = {
  rAAPL: 0.014,
  rNVDA: 0.026,
  rTSLA: 0.032,
  rMSFT: 0.015,
  rAMZN: 0.018,
};

export function history(symbol: SymbolCode, days = 90, end = new Date()): Bar[] {
  const inst = getInstrument(symbol);
  const rand = mulberry32(hashSeed(`hist:${symbol}:v3`));
  let px = BASE_PRICES[symbol] * (0.86 + rand() * 0.08);
  const bars: Bar[] = [];
  const cursor = new Date(Date.UTC(end.getUTCFullYear(), end.getUTCMonth(), end.getUTCDate()));
  cursor.setUTCDate(cursor.getUTCDate() - days);

  for (let i = 0; i < days; i++) {
    const overnight = gaussian(rand) * DAILY_VOL[symbol] * 0.55;
    const cashSession = gaussian(rand) * DAILY_VOL[symbol] * 0.7;
    const open = round(px * (1 + overnight), inst.tick);
    const close = round(open * (1 + cashSession), inst.tick);
    const high = round(Math.max(open, close) * (1 + Math.abs(gaussian(rand)) * 0.004), inst.tick);
    const low = round(Math.min(open, close) * (1 - Math.abs(gaussian(rand)) * 0.004), inst.tick);
    bars.push({
      t: cursor.toISOString().slice(0, 10),
      open,
      high,
      low,
      close,
      overnightRet: overnight,
    });
    px = close;
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }
  return bars;
}

function round(n: number, tick: number): number {
  return Math.round(n / tick) * tick;
}
