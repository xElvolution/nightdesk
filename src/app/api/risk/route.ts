import { NextResponse } from "next/server";
import { RISK_RULES } from "@/lib/risk/rules";
import { EARNINGS_HOURS, evaluateRisk } from "@/lib/risk/engine";
import { quoteAt } from "@/lib/market/quotes";
import { runResearch } from "@/lib/agents/research";
import { runSentiment } from "@/lib/agents/sentiment";
import { emptyAccount } from "@/lib/paper/account";
import type { Side, SymbolCode } from "@/lib/types";

export const dynamic = "force-dynamic";

export function GET() {
  return NextResponse.json({
    rules: RISK_RULES,
    earningsHours: EARNINGS_HOURS,
    count: RISK_RULES.length,
  });
}

export async function POST(req: Request) {
  const body = (await req.json().catch(() => ({}))) as {
    symbol?: SymbolCode;
    side?: Side;
    qty?: number;
    killSwitch?: boolean;
  };
  const ts = Date.now();
  const symbol = body.symbol ?? "rNVDA";
  const quote = quoteAt(symbol, ts);
  const research = runResearch(symbol, quote);
  const sentiment = runSentiment(symbol, quote);
  const decision = evaluateRisk({
    symbol,
    side: body.side ?? "buy",
    qty: body.qty ?? 20,
    quote,
    account: emptyAccount(),
    research,
    sentiment,
    killSwitch: !!body.killSwitch,
    earningsHours: EARNINGS_HOURS,
  });
  return NextResponse.json({ quote, research, sentiment, decision });
}
