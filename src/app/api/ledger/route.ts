import { NextResponse } from "next/server";
import { readLedger, writeLedger } from "@/lib/ledger/store";
import { parseHoldingsCsv } from "@/lib/holdings";
import { bookToAccount } from "@/lib/holdings";
import { markAccount } from "@/lib/paper/account";
import { bookQuotes } from "@/lib/market/quotes";
import { readSession } from "@/lib/operators/session";
import type { AuditEvent, BookFile, Fill, PaperAccount } from "@/lib/types";

export const dynamic = "force-dynamic";

async function requireOperatorId() {
  const session = await readSession();
  return session?.operatorId ?? null;
}

export async function GET() {
  const operatorId = await requireOperatorId();
  if (!operatorId) {
    return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  }
  return NextResponse.json(await readLedger(operatorId));
}

export async function POST(req: Request) {
  const operatorId = await requireOperatorId();
  if (!operatorId) {
    return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  }
  const body = (await req.json().catch(() => ({}))) as {
    csv?: string;
    name?: string;
    book?: BookFile | null;
    fills?: Fill[];
    audit?: AuditEvent[];
    account?: PaperAccount | null;
    clear?: boolean;
  };
  if (body.clear) {
    return NextResponse.json(
      await writeLedger({ book: null, fills: [], audit: [], account: null }, operatorId),
    );
  }

  const patch: Parameters<typeof writeLedger>[0] = {};
  if (body.book !== undefined) {
    patch.book = body.book;
    if (body.book && body.account === undefined) {
      patch.account = markAccount(bookToAccount(body.book), bookQuotes(Date.now()));
    }
  } else if (body.csv) {
    const book = parseHoldingsCsv(body.csv, body.name ?? "holdings.csv");
    book.raw = body.csv;
    patch.book = book;
    patch.account = markAccount(bookToAccount(book), bookQuotes(Date.now()));
  }
  if (body.fills) patch.fills = body.fills;
  if (body.audit) patch.audit = body.audit;
  if (body.account !== undefined) patch.account = body.account;

  return NextResponse.json(await writeLedger(patch, operatorId));
}
