import type { Instrument, SymbolCode } from "./types";

export const STARTING_CASH = 100_000;
export const FEE_BPS = 4;
export const PREVIEW_MS = 8_000;
export const MAX_STALE_MS = 4_000;

export const UNIVERSE: Instrument[] = [
  {
    symbol: "rAAPL",
    underlying: "AAPL",
    name: "Apple Inc.",
    sector: "Technology",
    cluster: "mega-cap-tech",
    tick: 0.01,
    lot: 1,
    avgDailyNotionalUsdt: 18_400_000,
  },
  {
    symbol: "rNVDA",
    underlying: "NVDA",
    name: "NVIDIA Corporation",
    sector: "Technology",
    cluster: "mega-cap-tech",
    tick: 0.01,
    lot: 1,
    avgDailyNotionalUsdt: 42_700_000,
  },
  {
    symbol: "rTSLA",
    underlying: "TSLA",
    name: "Tesla Inc.",
    sector: "Automotive",
    cluster: "auto-ev",
    tick: 0.01,
    lot: 1,
    avgDailyNotionalUsdt: 21_100_000,
  },
  {
    symbol: "rMSFT",
    underlying: "MSFT",
    name: "Microsoft Corporation",
    sector: "Technology",
    cluster: "mega-cap-tech",
    tick: 0.01,
    lot: 1,
    avgDailyNotionalUsdt: 16_900_000,
  },
  {
    symbol: "rAMZN",
    underlying: "AMZN",
    name: "Amazon.com Inc.",
    sector: "Consumer",
    cluster: "mega-cap-tech",
    tick: 0.01,
    lot: 1,
    avgDailyNotionalUsdt: 14_200_000,
  },
];

export const SYMBOLS = UNIVERSE.map((i) => i.symbol);

export function getInstrument(symbol: SymbolCode): Instrument {
  const row = UNIVERSE.find((i) => i.symbol === symbol);
  if (!row) throw new Error(`Unknown symbol ${symbol}`);
  return row;
}

export const BASE_PRICES: Record<SymbolCode, number> = {
  rAAPL: 228.4,
  rNVDA: 177.9,
  rTSLA: 249.6,
  rMSFT: 428.1,
  rAMZN: 191.7,
};
