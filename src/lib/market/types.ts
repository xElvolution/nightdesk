import type { Quote } from "../types";

export type VenueMode = "live" | "recorded";
export type VenueStatus = "connected" | "reconnecting" | "rate_limited" | "error";

export interface VenueHealth {
  venue: "bitget";
  mode: VenueMode;
  status: VenueStatus;
  lastHeartbeat: number;
  lastError: string | null;
  reconnectAttempt: number;
  rateLimitRemaining: number;
  latencyMs: number;
  symbols: string[];
}

export interface MarketSnapshot {
  health: VenueHealth;
  quotes: Quote[];
}

export interface MarketAdapter {
  id: VenueMode;
  snapshot(): Promise<MarketSnapshot>;
}
