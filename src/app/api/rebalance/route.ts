import { NextResponse } from "next/server";
import { parseHoldingsCsv, sampleBook, bookToAccount } from "@/lib/holdings";
import { planRebalance } from "@/lib/rebalance";
import { sealReceipt, bundleReceipts } from "@/lib/agents/receipt";
import { applyFill, makeFill, markAccount } from "@/lib/paper/account";
import { bookQuotes, quoteAt } from "@/lib/market/quotes";
import { detectAnomalies } from "@/lib/agents/execution";
import type { ActionReceipt, BookFile, Fill } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const body = (await req.json().catch(() => ({}))) as {
    csv?: string;
    killSwitch?: boolean;
    /** When true, apply live legs (paper) and seal every receipt. */
    submit?: boolean;
  };
  const book = body.csv ? parseHoldingsCsv(body.csv) : sampleBook();
  if (body.csv) book.raw = body.csv;
  const ts = Date.now();
  const plan = planRebalance(book, ts, !!body.killSwitch);

  if (!body.submit) {
    return NextResponse.json(plan);
  }

  if (body.killSwitch) {
    return NextResponse.json(
      { ok: false, status: "cancelled", reason: "Kill switch blocked submission.", plan },
      { status: 409 },
    );
  }

  // Anomaly gate on each trade leg before fill
  for (const leg of plan.legs) {
    const q = quoteAt(leg.symbol, Date.now());
    const cycle = plan.cycles.find((c) => c.symbol === leg.symbol);
    if (!cycle?.preview && leg.qty > 0) {
      // synthesize from leg for anomaly check
    }
    const preview = {
      id: leg.receipt.id,
      symbol: leg.symbol,
      side: leg.side,
      qty: leg.qty,
      limitPrice: leg.limitPrice,
      notional: leg.notional,
      status: "preview" as const,
      research: cycle?.research ?? {
        symbol: leg.symbol,
        bias: "flat" as const,
        confidence: 0,
        horizonHours: 0,
        thesis: "",
        catalysts: [] as string[],
        risks: [] as string[],
        ts,
      },
      sentiment: cycle?.sentiment ?? {
        symbol: leg.symbol,
        score: 0,
        priorScore: 0,
        drivers: [],
        heat: "cold" as const,
        ts,
      },
      risk: leg.risk,
      anomalies: [] as [],
      previewUntil: ts + 8000,
      createdAt: ts,
    };
    const anomalies = detectAnomalies(q, preview);
    if (anomalies.length) {
      const sealed = plan.receipts.map((r) =>
        r.status === "preview"
          ? sealReceipt(r, "cancelled", { reason: `${r.reason} Cancel-on-anomaly: ${anomalies.join(", ")}.` })
          : r,
      );
      return NextResponse.json({
        ok: false,
        status: "cancelled",
        anomalies,
        plan: { ...plan, receipts: sealed, bundleHash: bundleReceipts(sealed) },
        reason: "Cancel-on-anomaly fired before ledger fill.",
      });
    }
  }

  let acc = bookToAccount(book, ts);
  const fills: Fill[] = [];
  const sealedLegs = new Map<string, ActionReceipt>();

  for (const leg of plan.legs) {
    const q = quoteAt(leg.symbol, Date.now());
    const px = leg.side === "sell" ? q.bid : q.ask;
    const sealed = sealReceipt(leg.receipt, "filled", {
      limitPrice: px,
      qty: leg.qty,
      reason: `${leg.reason} Filled.`,
      ts: Date.now(),
    });
    sealedLegs.set(leg.symbol, sealed);
    const fill = makeFill({
      orderId: `ord_${leg.symbol}_${ts}`,
      symbol: leg.symbol,
      side: leg.side,
      qty: leg.qty,
      price: px,
      ts: Date.now(),
      receiptHash: sealed.hash,
      receiptId: sealed.id,
    });
    acc = applyFill(acc, fill);
    fills.push(fill);
  }

  acc = markAccount(acc, bookQuotes(Date.now()));
  const sealed = plan.receipts.map((r) => {
    const filled = sealedLegs.get(r.symbol);
    if (filled) return filled;
    if (r.kind === "hold" || r.qty === 0) {
      return sealReceipt(r, "hold", { reason: `${r.reason} Confirmed overnight.`, ts: Date.now() });
    }
    return r;
  });
  const bundleHash = bundleReceipts(sealed);

  const lots = book.lots
    .map((lot) => {
      const leg = plan.legs.find((l) => l.symbol === lot.symbol);
      if (!leg) return lot;
      return { ...lot, qty: leg.toQty };
    })
    .filter((l) => l.qty !== 0);
  const nextBook: BookFile = { ...book, lots, cashUsdt: acc.cashUsdt };

  return NextResponse.json({
    ok: true,
    status: "filled",
    fills,
    account: acc,
    book: nextBook,
    plan: { ...plan, receipts: sealed, bundleHash },
    bundleHash,
    note: "Paper ledger fill. Every lot closed with a sized rToken receipt. No live Bitget order sent.",
  });
}

export function GET() {
  return NextResponse.json(planRebalance(sampleBook()));
}
