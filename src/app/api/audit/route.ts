import { NextResponse } from "next/server";
import { bootstrap } from "@/lib/seed";
import { runCycle } from "@/lib/agents/orchestrator";
import { appendAudit } from "@/lib/audit/log";
import { SYMBOLS } from "@/lib/universe";

export const dynamic = "force-dynamic";

export function GET() {
  const ts = Date.now();
  const state = bootstrap(ts - 60_000);
  for (const symbol of SYMBOLS) {
    const cycle = runCycle(symbol, ts - 40_000 + SYMBOLS.indexOf(symbol) * 1200);
    appendAudit(state.audit, {
      ts: cycle.ts,
      actor: "research",
      action: "brief",
      symbol,
      detail: cycle.research.thesis,
      payload: { bias: cycle.research.bias, confidence: cycle.research.confidence },
    });
    appendAudit(state.audit, {
      ts: cycle.ts + 10,
      actor: "sentiment",
      action: "print",
      symbol,
      detail: `Score ${cycle.sentiment.score} (${cycle.sentiment.heat}).`,
      payload: { score: cycle.sentiment.score },
    });
    appendAudit(state.audit, {
      ts: cycle.ts + 20,
      actor: "risk",
      action: "gate",
      symbol,
      detail: `Verdict ${cycle.risk.verdict}. ${cycle.risk.results.filter((r) => !r.passed).length} rules tripped.`,
      payload: { verdict: cycle.risk.verdict },
    });
    if (cycle.preview) {
      appendAudit(state.audit, {
        ts: cycle.ts + 30,
        actor: "execution",
        action: "preview",
        symbol,
        detail: `Preview ${cycle.preview.side} ${cycle.preview.qty} ${symbol} @ ${cycle.preview.limitPrice}.`,
      });
    }
  }
  return NextResponse.json({
    genesis: "genesis",
    count: state.audit.length,
    events: state.audit,
  });
}
