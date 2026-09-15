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
}

const DIR = path.join(process.cwd(), "data", "ledger");
const FILE = path.join(DIR, "state.json");

async function ensure() {
  await mkdir(DIR, { recursive: true });
}

export async function readLedger(): Promise<LedgerState> {
  await ensure();
  try {
    const raw = await readFile(FILE, "utf8");
    return JSON.parse(raw) as LedgerState;
  } catch {
    return { book: null, fills: [], audit: [], account: null, updatedAt: 0 };
  }
}

export async function writeLedger(partial: Partial<LedgerState>): Promise<LedgerState> {
  const prev = await readLedger();
  const next: LedgerState = {
    book: partial.book !== undefined ? partial.book : prev.book,
    fills: partial.fills ?? prev.fills,
    audit: partial.audit ?? prev.audit,
    account: partial.account !== undefined ? partial.account : prev.account,
    updatedAt: Date.now(),
  };
  if (next.book && !next.account) {
    next.account = markAccount(bookToAccount(next.book), bookQuotes(Date.now()));
  }
  await ensure();
  await writeFile(FILE, JSON.stringify(next, null, 2));
  return next;
}
