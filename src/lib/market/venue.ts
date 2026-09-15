import { bitgetLive } from "./bitget";
import { recordedTape } from "./recorded";
import type { MarketSnapshot } from "./types";

export async function venueSnapshot(): Promise<MarketSnapshot> {
  const preferLive = process.env.NIGHTDESK_FEED !== "recorded";
  if (preferLive) return bitgetLive.snapshot();
  return recordedTape.snapshot();
}
