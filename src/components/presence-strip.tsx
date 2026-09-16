"use client";

import { useEffect, useState } from "react";
import { cls } from "@/lib/format";
import { formatLagos } from "@/lib/clock";

interface PresenceRow {
  id: string;
  displayName: string;
  handle: string;
  initials: string;
  status: "online" | "away" | "offline";
  lastAction: string;
  lastActionAt: number;
}

export function PresenceStrip({ dense }: { dense?: boolean }) {
  const [rows, setRows] = useState<PresenceRow[]>([]);
  const [onlineCount, setOnlineCount] = useState(0);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const res = await fetch("/api/presence", { cache: "no-store" });
        if (!res.ok) return;
        const data = (await res.json()) as {
          strip: PresenceRow[];
          onlineCount: number;
        };
        if (!cancelled) {
          setRows(data.strip);
          setOnlineCount(data.onlineCount);
        }
      } catch {
        /* ignore */
      }
    };
    void load();
    const t = window.setInterval(load, 45_000);
    return () => {
      cancelled = true;
      window.clearInterval(t);
    };
  }, []);

  if (!rows.length) return null;

  if (dense) {
    return (
      <div className="flex flex-wrap items-center gap-2 rounded-xl border border-line bg-surface/70 px-3 py-2">
        <span className="text-[11px] text-faint">On desk</span>
        <div className="flex -space-x-1.5">
          {rows.slice(0, 8).map((r) => (
            <div
              key={r.id}
              title={`@${r.handle} · ${r.lastAction} · ${formatLagos(r.lastActionAt)} WAT`}
              className="relative flex h-7 w-7 items-center justify-center rounded-full border border-bg bg-accent/15 text-[9px] font-semibold text-accent"
            >
              {r.initials}
              <span
                className={cls(
                  "absolute -bottom-0.5 -right-0.5 h-2 w-2 rounded-full border border-bg",
                  r.status === "online"
                    ? "bg-gain"
                    : r.status === "away"
                      ? "bg-warn"
                      : "bg-faint",
                )}
              />
            </div>
          ))}
        </div>
        <span className="tabular text-[11px] text-mute">
          {onlineCount} online
        </span>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-line bg-surface/80 px-3 py-2.5">
      <div className="mb-2 flex items-center justify-between gap-2">
        <div className="text-[10px] font-medium tracking-[0.14em] text-faint uppercase">
          On desk
        </div>
        <div className="text-[11px] tabular text-mute">
          {onlineCount} online · {rows.length} on book
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        {rows.map((r) => (
          <div
            key={r.id}
            className="flex min-w-[140px] max-w-[220px] flex-1 items-start gap-2 rounded-lg border border-line/80 bg-bg/40 px-2 py-1.5"
            title={`${r.lastAction} · ${formatLagos(r.lastActionAt)} WAT`}
          >
            <div className="relative mt-0.5">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-accent/10 text-[10px] font-semibold text-accent">
                {r.initials}
              </div>
              <span
                className={cls(
                  "absolute -bottom-0.5 -right-0.5 h-2 w-2 rounded-full border border-bg",
                  r.status === "online"
                    ? "bg-gain"
                    : r.status === "away"
                      ? "bg-warn"
                      : "bg-faint",
                )}
              />
            </div>
            <div className="min-w-0 flex-1">
              <div className="truncate text-[11px] font-medium text-ink">
                {r.displayName}
              </div>
              <div className="truncate text-[10px] text-faint">@{r.handle}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
