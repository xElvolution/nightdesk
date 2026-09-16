import { NextResponse } from "next/server";
import { runCycle } from "@/lib/agents/orchestrator";
import { detectAnomalies } from "@/lib/agents/execution";
import { quoteAt } from "@/lib/market/quotes";
import { emptyAccount, applyFill, makeFill, markAccount } from "@/lib/paper/account";
import { bookQuotes } from "@/lib/market/quotes";
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

  if (!cycle.preview) {
    return NextResponse.json(
      { ok: false, reason: "No preview. Research and sentiment did not agree, or risk blocked.", cycle },
      { status: 409 },
    );
  }

  const anomalies = detectAnomalies(quote, cycle.preview);
  if (anomalies.length || cycle.preview.status === "rejected") {
    return NextResponse.json({
      ok: false,
      status: "cancelled",
      anomalies,
      cycle,
      reason: "Cancel-on-anomaly fired before ledger fill.",
    });
  }

  const fill = makeFill({
    orderId: cycle.preview.id,
    symbol,
    side: cycle.preview.side,
    qty: cycle.preview.qty,
    price: cycle.preview.limitPrice,
    ts,
  });
  const account = markAccount(applyFill(emptyAccount(), fill), bookQuotes(ts));
  return NextResponse.json({
    ok: true,
    status: "filled",
    fill,
    account,
    cycle,
    note: "Ledger fill. No live Bitget order sent.",
  });
}
