"use client";

import { useEffect, useState } from "react";
import { clockPair } from "@/lib/clock";

export function ClockPair() {
  const [c, setC] = useState(() => clockPair());
  useEffect(() => {
    const id = setInterval(() => setC(clockPair()), 1000);
    return () => clearInterval(id);
  }, []);
  return (
    <div className="flex flex-wrap gap-4 text-[12px] tabular">
      <div>
        <div className="text-[10px] uppercase tracking-[0.16em] text-amber">Lagos</div>
        <div className="text-ink">{c.lagos}</div>
      </div>
      <div>
        <div className="text-[10px] uppercase tracking-[0.16em] text-faint">New York</div>
        <div className="text-mute">{c.ny}</div>
      </div>
      <div>
        <div className="text-[10px] uppercase tracking-[0.16em] text-faint">Session</div>
        <div className="text-mute">{c.session}</div>
      </div>
    </div>
  );
}
