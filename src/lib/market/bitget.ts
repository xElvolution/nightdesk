import { getInstrument } from "../universe";
import { sessionLabel } from "../clock";
import type { Quote, SymbolCode } from "../types";
import { recordedTape } from "./recorded";
import type { MarketAdapter, MarketSnapshot } from "./types";

const BITGET_SYMBOL: Record<SymbolCode, string> = {
  rAAPL: "AAPLUSDT",
  rNVDA: "NVDAUSDT",
  rTSLA: "TSLAUSDT",
  rMSFT: "MSFTUSDT",
  rAMZN: "AMZNUSDT",
};

class RateLimitError extends Error {
  constructor() {
    super("bitget 429");
    this.name = "RateLimitError";
  }
}

async function fetchTicker(symbol: SymbolCode): Promise<Quote> {
  const pair = BITGET_SYMBOL[symbol];
  const url = `https://api.bitget.com/api/v2/spot/market/tickers?symbol=${pair}`;
  const res = await fetch(url, {
    headers: { Accept: "application/json", "User-Agent": "NightDesk/1.0" },
    signal: AbortSignal.timeout(4000),
    cache: "no-store",
  });
  if (res.status === 429) throw new RateLimitError();
  if (!res.ok) throw new Error(`bitget HTTP ${res.status}`);
  const body = (await res.json()) as {
    code?: string;
    data?: Array<{ lastPr?: string; bidPr?: string; askPr?: string; ts?: string; change24h?: string }>;
  };
  const row = body.data?.[0];
  if (body.code !== "00000" || !row?.lastPr) throw new Error("bitget empty ticker");
  const inst = getInstrument(symbol);
  const last = Number(row.lastPr);
  const bid = Number(row.bidPr ?? last);
  const ask = Number(row.askPr ?? last);
  const mid = (bid + ask) / 2;
  const ts = Number(row.ts ?? Date.now());
  return {
    symbol,
    bid,
    ask,
    last,
    mid,
    spreadBps: mid ? ((ask - bid) / mid) * 10_000 : 0,
    changePct: Number(row.change24h ?? 0) * 100,
    volume: 0,
    ts,
    session: sessionLabel(ts),
    staleMs: Math.max(0, Date.now() - ts),
  };
}

class BitgetLive implements MarketAdapter {
  id = "live" as const;
  private fail = 0;

  async snapshot(): Promise<MarketSnapshot> {
    const t0 = Date.now();
    const keys = Boolean(process.env.BITGET_API_KEY && process.env.BITGET_SECRET_KEY);
    try {
      const symbols = Object.keys(BITGET_SYMBOL) as SymbolCode[];
      const quotes = await Promise.all(symbols.map(fetchTicker));
      this.fail = 0;
      return {
        health: {
          venue: "bitget",
          mode: "live",
          status: "connected",
          lastHeartbeat: Date.now(),
          lastError: null,
          reconnectAttempt: 0,
          rateLimitRemaining: keys ? 80 : 40,
          latencyMs: Date.now() - t0,
          symbols: quotes.map((q) => q.symbol),
        },
        quotes,
      };
    } catch (e) {
      this.fail += 1;
      const recorded = await recordedTape.snapshot();
      const rate = e instanceof RateLimitError;
      recorded.health.mode = "recorded";
      recorded.health.status = rate ? "rate_limited" : this.fail > 2 ? "reconnecting" : "error";
      recorded.health.lastError = e instanceof Error ? e.message : "bitget feed failed";
      recorded.health.reconnectAttempt = this.fail;
      recorded.health.latencyMs = Date.now() - t0;
      return recorded;
    }
  }
}

export const bitgetLive = new BitgetLive();
