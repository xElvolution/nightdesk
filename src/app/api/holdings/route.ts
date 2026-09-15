import { NextResponse } from "next/server";
import { parseHoldingsCsv, sampleBook, SAMPLE_CSV, csvTemplate } from "@/lib/holdings";
import { bookToAccount } from "@/lib/holdings";

export const dynamic = "force-dynamic";

export function GET() {
  return NextResponse.json({
    template: csvTemplate(),
    example: SAMPLE_CSV,
    book: sampleBook(),
  });
}

export async function POST(req: Request) {
  const body = (await req.json().catch(() => ({}))) as { csv?: string; name?: string };
  if (!body.csv) return NextResponse.json({ error: "csv string required" }, { status: 400 });
  try {
    const book = parseHoldingsCsv(body.csv, body.name ?? "holdings.csv");
    book.raw = body.csv;
    return NextResponse.json({ book, account: bookToAccount(book) });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "parse failed" }, { status: 400 });
  }
}
