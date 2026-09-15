"use client";

import { useEffect, useState } from "react";
import { pct } from "@/lib/format";
import type { Quote } from "@/lib/types";
import type { VenueHealth } from "@/lib/market/types";

export function Ticker() {
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [health, setHealth] = useState<VenueHealth | null>(null);

  useEffect(() => {
    let alive = true;
    const tick = async () => {
      try {
        const res = await fetch("/api/quotes", { cache: "no-store" });
        const json = (await res.json()) as { quotes: Quote[]; health: VenueHealth };
        if (!alive) return;
        setQuotes(json.quotes ?? []);
        setHealth(json.health ?? null);
      } catch {
        /* keep last tick */
      }
    };
    tick();
    const id = setInterval(tick, 1500);
    return () => {
      alive = false;
      clearInterval(id);
    };
  }, []);

  if (!quotes.length) return null;

  return (
    <div className="border-t border-line bg-surface/90">
      <div className="ticker-mask flex gap-6 overflow-x-auto px-4 py-1.5 text-[11px] tabular">
        {quotes.map((q) => (
          <div key={q.symbol} className="flex items-center gap-2 whitespace-nowrap">
            <span className="tracking-wide text-mute">{q.symbol}</span>
            <span className="font-medium text-ink">{q.last.toFixed(2)}</span>
            <span className={q.changePct >= 0 ? "text-gain" : "text-loss"}>
              {pct(q.changePct)}
            </span>
            <span className="text-faint">{q.spreadBps.toFixed(1)} bps</span>
          </div>
        ))}
        <div className="ml-auto shrink-0 text-faint uppercase tracking-[0.12em]">
          {quotes[0]?.session === "us-cash-open" ? "US cash open" : "US cash closed · rToken overnight"}
          {health ? ` · ${health.mode}` : ""}
        </div>
      </div>
    </div>
  );
}
