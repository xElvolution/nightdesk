"use client";

import { useMemo, useState } from "react";
import { history } from "@/lib/market/history";
import { SYMBOLS } from "@/lib/universe";
import type { SymbolCode } from "@/lib/types";
import { cls, pct } from "@/lib/format";

export function PriceChart({ symbol: initial }: { symbol?: SymbolCode }) {
  const [symbol, setSymbol] = useState<SymbolCode>(initial ?? "rNVDA");
  const bars = useMemo(() => history(symbol, 60), [symbol]);
  const closes = bars.map((b) => b.close);
  const last = closes[closes.length - 1] ?? 0;
  const prev = closes[closes.length - 2] ?? last;
  const change = prev ? ((last - prev) / prev) * 100 : 0;
  const up = change >= 0;

  const min = Math.min(...closes);
  const max = Math.max(...closes);
  const span = max - min || 1;
  const w = 640;
  const h = 200;
  const path = closes
    .map((c, i) => {
      const x = (i / (closes.length - 1)) * w;
      const y = h - 16 - ((c - min) / span) * (h - 32);
      return `${i === 0 ? "M" : "L"}${x.toFixed(1)} ${y.toFixed(1)}`;
    })
    .join(" ");
  const area = `${path} L${w} ${h} L0 ${h} Z`;

  return (
    <div className="rounded-[14px] border border-line bg-surface">
      <div className="flex flex-wrap items-center gap-2 border-b border-line px-4 py-3">
        <div className="label text-accent">Chart</div>
        <div className="ml-auto flex flex-wrap gap-1">
          {SYMBOLS.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setSymbol(s)}
              className={cls(
                "rounded-lg px-2 py-1 text-[11px] tracking-wide",
                s === symbol
                  ? "bg-accent/10 text-accent shadow-[inset_0_0_0_1px_rgba(77,232,255,0.2)]"
                  : "text-faint hover:text-ink",
              )}
            >
              {s}
            </button>
          ))}
        </div>
      </div>
      <div className="px-4 pt-3">
        <div className="flex items-end gap-3">
          <div className="text-[24px] font-medium tracking-tight tabular text-ink">
            {last.toFixed(2)}
          </div>
          <div className={cls("mb-1 text-[12px] tabular", up ? "text-gain" : "text-loss")}>
            {pct(change)}
          </div>
          <div className="mb-1 text-[11px] text-faint">USDT · 60d overnight path</div>
        </div>
      </div>
      <svg viewBox={`0 0 ${w} ${h}`} className="mt-1 h-44 w-full px-2" preserveAspectRatio="none" role="img" aria-label={`${symbol} price`}>
        <defs>
          <linearGradient id="pcFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={up ? "#22C55E" : "#F43F5E"} stopOpacity="0.18" />
            <stop offset="100%" stopColor={up ? "#22C55E" : "#F43F5E"} stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={area} fill="url(#pcFill)" />
        <path d={path} fill="none" stroke={up ? "#22C55E" : "#F43F5E"} strokeWidth="1.8" />
      </svg>
    </div>
  );
}
