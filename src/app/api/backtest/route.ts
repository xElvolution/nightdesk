import { NextResponse } from "next/server";
import { runBacktest } from "@/lib/backtest/engine";
import type { SymbolCode } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const body = (await req.json().catch(() => ({}))) as {
    from?: string;
    to?: string;
    symbols?: SymbolCode[];
    startingCash?: number;
  };
  const report = runBacktest(body);
  return NextResponse.json(report);
}

export function GET() {
  return NextResponse.json(runBacktest());
}
