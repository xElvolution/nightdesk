import { NextResponse } from "next/server";
import { runCycle } from "@/lib/agents/orchestrator";
import { detectAnomalies } from "@/lib/agents/execution";
import { sealReceipt } from "@/lib/agents/receipt";
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
    const receipt = sealReceipt(cycle.receipt, "hold", {
      reason: `${cycle.receipt.reason} Confirmed hold.`,
      ts,
    });
    return NextResponse.json({
      ok: true,
      status: "hold",
      cycle: { ...cycle, receipt },
      receipt,
      note: "HOLD is a sized action. Receipt sealed. No ledger fill.",
    });
  }

  const anomalies = detectAnomalies(quote, cycle.preview);
  if (anomalies.length || cycle.preview.status === "rejected") {
    const receipt = sealReceipt(cycle.receipt, "cancelled", {
      reason: `${cycle.receipt.reason} Cancel-on-anomaly: ${anomalies.join(", ") || "rejected"}.`,
    });
    return NextResponse.json({
      ok: false,
      status: "cancelled",
      anomalies,
      cycle: { ...cycle, receipt },
      receipt,
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
    receiptHash: cycle.receipt.hash,
    receiptId: cycle.receipt.id,
  });
  const sealed = sealReceipt(cycle.receipt, "filled", {
    limitPrice: fill.price,
    qty: fill.qty,
    reason: `${cycle.receipt.reason} Filled.`,
    ts,
  });
  fill.receiptHash = sealed.hash;
  fill.receiptId = sealed.id;
  const account = markAccount(applyFill(emptyAccount(), fill), bookQuotes(ts));
  return NextResponse.json({
    ok: true,
    status: "filled",
    fill,
    account,
    cycle: { ...cycle, receipt: sealed },
    receipt: sealed,
    note: "Ledger fill with sealed receipt. No live Bitget order sent.",
  });
}
