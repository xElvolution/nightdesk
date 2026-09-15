import { NextResponse } from "next/server";
import { emptyAccount, markAccount } from "@/lib/paper/account";
import { bookQuotes } from "@/lib/market/quotes";
import { STARTING_CASH, UNIVERSE } from "@/lib/universe";
import { readLedger } from "@/lib/ledger/store";

export const dynamic = "force-dynamic";

export async function GET() {
  const ts = Date.now();
  const ledger = await readLedger();
  const account = ledger.account ?? markAccount(emptyAccount(), bookQuotes(ts));
  return NextResponse.json({
    ts,
    startingCash: STARTING_CASH,
    account,
    fills: ledger.fills,
    universe: UNIVERSE.map((u) => u.symbol),
    venue: "bitget",
    feeBps: 4,
  });
}
