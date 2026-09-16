import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import type { AuditEvent, BookFile, Fill, PaperAccount } from "../types";
import { bookToAccount } from "../holdings";
import { bookQuotes } from "../market/quotes";
import { markAccount } from "../paper/account";

export interface LedgerState {
  book: BookFile | null;
  fills: Fill[];
  audit: AuditEvent[];
  account: PaperAccount | null;
  updatedAt: number;
  operatorId?: string;
}

const DIR = path.join(process.cwd(), "data", "ledger");

function fileFor(operatorId?: string | null): string {
  const id = operatorId && /^[a-zA-Z0-9_-]+$/.test(operatorId) ? operatorId : "anonymous";
  return path.join(DIR, `${id}.json`);
}

async function ensure() {
  await mkdir(DIR, { recursive: true });
}

export async function readLedger(operatorId?: string | null): Promise<LedgerState> {
  await ensure();
  try {
    const raw = await readFile(fileFor(operatorId), "utf8");
    return JSON.parse(raw) as LedgerState;
  } catch {
    return { book: null, fills: [], audit: [], account: null, updatedAt: 0, operatorId: operatorId ?? undefined };
  }
}

export async function writeLedger(
  partial: Partial<LedgerState>,
  operatorId?: string | null,
): Promise<LedgerState> {
  const id = operatorId ?? partial.operatorId ?? null;
  const prev = await readLedger(id);
  const next: LedgerState = {
    book: partial.book !== undefined ? partial.book : prev.book,
    fills: partial.fills ?? prev.fills,
    audit: partial.audit ?? prev.audit,
    account: partial.account !== undefined ? partial.account : prev.account,
    updatedAt: Date.now(),
    operatorId: id ?? undefined,
  };
  if (next.book && !next.account) {
    next.account = markAccount(bookToAccount(next.book), bookQuotes(Date.now()));
  }
  await ensure();
  await writeFile(fileFor(id), JSON.stringify(next, null, 2));
  return next;
}

export async function replaceLedger(state: LedgerState, operatorId: string): Promise<LedgerState> {
  const next: LedgerState = { ...state, operatorId, updatedAt: Date.now() };
  await ensure();
  await writeFile(fileFor(operatorId), JSON.stringify(next, null, 2));
  return next;
}
