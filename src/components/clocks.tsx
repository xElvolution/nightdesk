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
        <div className="label text-accent">Lagos</div>
        <div className="mt-0.5 text-ink">{c.lagos}</div>
      </div>
      <div>
        <div className="label">New York</div>
        <div className="mt-0.5 text-mute">{c.ny}</div>
      </div>
      <div>
        <div className="label">Session</div>
        <div className="mt-0.5 text-mute">{c.session}</div>
      </div>
    </div>
  );
}
