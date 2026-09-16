import { NextResponse } from "next/server";
import { runCycle } from "@/lib/agents/orchestrator";
import { detectAnomalies } from "@/lib/agents/execution";
import { quoteAt } from "@/lib/market/quotes";
import { emptyAccount } from "@/lib/paper/account";
import type { SymbolCode } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const body = (await req.json().catch(() => ({}))) as {
    symbol?: SymbolCode;
    killSwitch?: boolean;
  };
  const ts = Date.now();
  const symbol = body.symbol ?? "rNVDA";
  const cycle = runCycle(symbol, ts, emptyAccount(), !!body.killSwitch);
  const quote = quoteAt(symbol, ts);
  const anomalies = cycle.preview ? detectAnomalies(quote, cycle.preview) : [];
  return NextResponse.json({
    ts,
    cycle,
    anomalies,
    previewMs: 8000,
    note: "Preview arms for 8 seconds. Any anomaly cancels before ledger fill.",
  });
}
