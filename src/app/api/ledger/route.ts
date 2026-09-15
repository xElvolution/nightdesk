import { NextResponse } from "next/server";
import { readLedger, writeLedger } from "@/lib/ledger/store";
import { parseHoldingsCsv } from "@/lib/holdings";
import { bookToAccount } from "@/lib/holdings";
import { markAccount } from "@/lib/paper/account";
import { bookQuotes } from "@/lib/market/quotes";
import type { AuditEvent, Fill } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(await readLedger());
}

export async function POST(req: Request) {
  const body = (await req.json().catch(() => ({}))) as {
    csv?: string;
    name?: string;
    fills?: Fill[];
    audit?: AuditEvent[];
    clear?: boolean;
  };
  if (body.clear) {
    return NextResponse.json(
      await writeLedger({ book: null, fills: [], audit: [], account: null }),
    );
  }
  if (body.csv) {
    const book = parseHoldingsCsv(body.csv, body.name ?? "holdings.csv");
    const account = markAccount(bookToAccount(book), bookQuotes(Date.now()));
    return NextResponse.json(await writeLedger({ book, account }));
  }
  return NextResponse.json(
    await writeLedger({
      fills: body.fills,
      audit: body.audit,
    }),
  );
}
