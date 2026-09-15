import { fnv1a } from "../hash";
import type { ActionReceipt, AgentId, DeskCycle, OrderPreview, RiskDecision, SymbolCode } from "../types";

const AGENTS: AgentId[] = ["research", "sentiment", "risk", "execution"];

export function stampReceipt(input: {
  symbol: SymbolCode;
  ts: number;
  preview: OrderPreview | null;
  risk: RiskDecision;
  reason: string;
}): ActionReceipt {
  const kind = input.preview ? input.preview.side : "hold";
  const qty = input.preview?.qty ?? 0;
  const limitPrice = input.preview?.limitPrice ?? 0;
  const status =
    !input.preview || qty === 0
      ? "hold"
      : input.preview.status === "rejected" || input.risk.verdict === "block"
        ? "rejected"
        : "preview";
  const body = JSON.stringify({
    symbol: input.symbol,
    ts: input.ts,
    kind,
    qty,
    limitPrice,
    status,
    verdict: input.risk.verdict,
  });
  const hash = fnv1a(body);
  return {
    id: `rcpt_${hash}`,
    hash,
    ts: input.ts,
    symbol: input.symbol,
    kind,
    qty,
    limitPrice,
    notional: qty * limitPrice,
    status,
    reason: input.reason,
    agents: AGENTS,
    riskVerdict: input.risk.verdict,
  };
}

export function receiptLine(r: ActionReceipt): string {
  if (r.kind === "hold" || r.qty === 0) {
    return `HOLD 0 ${r.symbol} · receipt ${r.hash}`;
  }
  return `${r.kind.toUpperCase()} ${r.qty} ${r.symbol} @ ${r.limitPrice.toFixed(2)} · ${r.status} · receipt ${r.hash}`;
}

export function withReceipt(cycle: Omit<DeskCycle, "receipt"> & { receipt?: ActionReceipt }): DeskCycle {
  const reason = cycle.preview
    ? `${cycle.preview.side} ${cycle.preview.qty} ${cycle.symbol} sized by research, confirmed by sentiment, gated by risk.`
    : `HOLD 0 ${cycle.symbol}. Research and sentiment did not agree, or risk blocked new risk.`;
  const receipt =
    cycle.receipt ??
    stampReceipt({
      symbol: cycle.symbol,
      ts: cycle.ts,
      preview: cycle.preview,
      risk: cycle.risk,
      reason,
    });
  return { ...cycle, receipt };
}
