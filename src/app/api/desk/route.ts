import { NextResponse } from "next/server";
import { runCycle } from "@/lib/agents/orchestrator";
import { emptyAccount } from "@/lib/paper/account";
import { SYMBOLS } from "@/lib/universe";
import type { SymbolCode } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const body = (await req.json().catch(() => ({}))) as {
    symbol?: SymbolCode;
    all?: boolean;
    killSwitch?: boolean;
    equity?: number;
  };
  const ts = Date.now();
  const account = emptyAccount(body.equity ?? 100_000);
  if (body.all) {
    const cycles = SYMBOLS.map((s) => runCycle(s, ts, account, !!body.killSwitch));
    return NextResponse.json({ ts, cycles });
  }
  const symbol = body.symbol ?? "rNVDA";
  if (!SYMBOLS.includes(symbol)) {
    return NextResponse.json({ error: "unknown symbol" }, { status: 400 });
  }
  return NextResponse.json({ ts, cycle: runCycle(symbol, ts, account, !!body.killSwitch) });
}

export function GET() {
  const ts = Date.now();
  const cycles = SYMBOLS.map((s) => runCycle(s, ts));
  return NextResponse.json({ ts, cycles });
}
