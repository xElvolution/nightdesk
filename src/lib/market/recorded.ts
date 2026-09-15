import { bookQuotes } from "./quotes";
import { SYMBOLS } from "../universe";
import type { MarketAdapter, MarketSnapshot, VenueHealth, VenueStatus } from "./types";

const RATE_BUDGET = 120;

class RecordedTape implements MarketAdapter {
  id = "recorded" as const;
  private status: VenueStatus = "connected";
  private lastError: string | null = null;
  private reconnectAttempt = 0;
  private remaining = RATE_BUDGET;
  private lastHeartbeat = Date.now();
  private until = 0;
  private ticks = 0;

  async snapshot(): Promise<MarketSnapshot> {
    const t0 = Date.now();
    this.ticks += 1;
    this.remaining = Math.max(0, this.remaining - 1);
    if (Date.now() < this.until) {
      return this.pack(t0, this.status);
    }

    if (this.remaining === 0) {
      this.status = "rate_limited";
      this.lastError = "429 rate limited. Backing off 1.8s.";
      this.until = Date.now() + 1800;
      this.remaining = RATE_BUDGET;
      this.reconnectAttempt += 1;
      return this.pack(t0, "rate_limited");
    }

    if (this.ticks % 47 === 0) {
      this.status = "reconnecting";
      this.lastError = "Venue heartbeat dropped. Reconnecting.";
      this.until = Date.now() + 900;
      this.reconnectAttempt += 1;
      return this.pack(t0, "reconnecting");
    }

    this.status = "connected";
    this.lastError = null;
    this.lastHeartbeat = Date.now();
    return this.pack(t0, "connected");
  }

  private pack(t0: number, status: VenueStatus): MarketSnapshot {
    const quotes = status === "connected" ? bookQuotes(Date.now()) : bookQuotes(this.lastHeartbeat);
    const health: VenueHealth = {
      venue: "bitget",
      mode: "recorded",
      status,
      lastHeartbeat: this.lastHeartbeat,
      lastError: this.lastError,
      reconnectAttempt: this.reconnectAttempt,
      rateLimitRemaining: this.remaining,
      latencyMs: Date.now() - t0,
      symbols: [...SYMBOLS],
    };
    return { health, quotes };
  }
}

export const recordedTape = new RecordedTape();
