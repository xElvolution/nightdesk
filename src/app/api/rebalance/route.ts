import { NextResponse } from "next/server";
import { parseHoldingsCsv, sampleBook } from "@/lib/holdings";
import { planRebalance } from "@/lib/rebalance";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const body = (await req.json().catch(() => ({}))) as {
    csv?: string;
    killSwitch?: boolean;
  };
  const book = body.csv ? parseHoldingsCsv(body.csv) : sampleBook();
  if (body.csv) book.raw = body.csv;
  const plan = planRebalance(book, Date.now(), !!body.killSwitch);
  return NextResponse.json(plan);
}

export function GET() {
  return NextResponse.json(planRebalance(sampleBook()));
}
