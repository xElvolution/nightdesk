import { chainHash } from "../hash";
import type { AgentId, AuditEvent, SymbolCode } from "../types";

export function appendAudit(
  events: AuditEvent[],
  input: {
    ts: number;
    actor: AgentId | "operator" | "system";
    action: string;
    symbol?: SymbolCode;
    detail: string;
    payload?: Record<string, unknown>;
  },
): AuditEvent {
  const prevHash = events.length ? events[events.length - 1].hash : "genesis";
  const body = JSON.stringify({
    ts: input.ts,
    actor: input.actor,
    action: input.action,
    symbol: input.symbol ?? "",
    detail: input.detail,
  });
  const hash = chainHash(prevHash, body);
  const event: AuditEvent = {
    id: `aud_${hash}`,
    ts: input.ts,
    actor: input.actor,
    action: input.action,
    symbol: input.symbol,
    detail: input.detail,
    payload: input.payload,
    hash,
    prevHash,
  };
  events.push(event);
  return event;
}
