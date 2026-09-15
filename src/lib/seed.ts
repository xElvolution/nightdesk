import { bookQuotes } from "./market/quotes";
import { emptyAccount, markAccount } from "./paper/account";
import { appendAudit } from "./audit/log";
import { runCycle } from "./agents/orchestrator";
import type { AuditEvent, DeskCycle, Fill, OrderPreview, PaperAccount } from "./types";

export interface DeskState {
  account: PaperAccount;
  quotesTs: number;
  previews: OrderPreview[];
  fills: Fill[];
  audit: AuditEvent[];
  lastCycles: Record<string, DeskCycle>;
  killSwitch: boolean;
}

export function bootstrap(ts = Date.now()): DeskState {
  const quotes = bookQuotes(ts);
  const account = markAccount(emptyAccount(), quotes);
  const audit: AuditEvent[] = [];
  appendAudit(audit, {
    ts,
    actor: "system",
    action: "desk.open",
    detail: "NightDesk ledger opened with 100,000 USDT. Universe: rAAPL rNVDA rTSLA rMSFT rAMZN.",
  });
  return {
    account,
    quotesTs: ts,
    previews: [],
    fills: [],
    audit,
    lastCycles: {},
    killSwitch: false,
  };
}

export function sampleCycle(symbol: "rAAPL" | "rNVDA" | "rTSLA" | "rMSFT" | "rAMZN", ts = Date.now()) {
  return runCycle(symbol, ts);
}
