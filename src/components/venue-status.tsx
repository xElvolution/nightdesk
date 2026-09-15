"use client";

import { useEffect, useState } from "react";
import type { VenueHealth } from "@/lib/market/types";
import { cls } from "@/lib/format";

export function VenueStatus() {
  const [h, setH] = useState<VenueHealth | null>(null);

  useEffect(() => {
    let alive = true;
    const tick = async () => {
      try {
        const res = await fetch("/api/venue", { cache: "no-store" });
        const json = (await res.json()) as VenueHealth;
        if (alive) setH(json);
      } catch {
        if (alive) {
          setH({
            venue: "bitget",
            mode: "recorded",
            status: "reconnecting",
            lastHeartbeat: Date.now(),
            lastError: "venue unreachable",
            reconnectAttempt: 1,
            rateLimitRemaining: 0,
            latencyMs: 0,
            symbols: [],
          });
        }
      }
    };
    tick();
    const id = setInterval(tick, 2500);
    return () => {
      alive = false;
      clearInterval(id);
    };
  }, []);

  if (!h) return <span className="text-[11px] text-faint">Venue…</span>;

  const color =
    h.status === "connected"
      ? "bg-gain"
      : h.status === "rate_limited"
        ? "bg-warn"
        : "bg-loss";
  const label =
    h.mode === "live"
      ? "Bitget live"
      : "Bitget recorded tape";

  return (
    <span className="flex items-center gap-1.5 text-[11px] text-mute" title={h.lastError ?? label}>
      <span className={cls("h-1.5 w-1.5 rounded-full", h.status === "connected" ? "pulse-dot" : "", color)} />
      {label}
      <span className="text-faint">{h.status.replace("_", " ")}</span>
    </span>
  );
}
