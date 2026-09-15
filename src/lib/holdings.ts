import { BASE_PRICES, getInstrument, SYMBOLS, UNIVERSE } from "./universe";
import { bookQuotes } from "./market/quotes";
import { emptyAccount, markAccount } from "./paper/account";
import type { BookFile, HoldingLot, PaperAccount, SymbolCode } from "./types";

export const SAMPLE_CSV = `symbol,qty,avg_price,note
rNVDA,85,162.40,core AI book
rAAPL,40,214.10,cash-flow ballast
rTSLA,55,238.00,too heavy into the print
rMSFT,18,401.20,cloud
rAMZN,22,186.50,AWS
USDT,12400,1.00,cash sleeve
`;

export const SAMPLE_BOOK_NAME = "holdings.template.csv";

const SYM_MAP: Record<string, SymbolCode | "CASH"> = {
  RAAPL: "rAAPL",
  AAPL: "rAAPL",
  RNVDA: "rNVDA",
  NVDA: "rNVDA",
  RTSLA: "rTSLA",
  TSLA: "rTSLA",
  RMSFT: "rMSFT",
  MSFT: "rMSFT",
  RAMZN: "rAMZN",
  AMZN: "rAMZN",
  USDT: "CASH",
  USD: "CASH",
  CASH: "CASH",
  USDC: "CASH",
};

export function parseHoldingsCsv(raw: string, name = "upload.csv"): BookFile {
  const lines = raw
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l && !l.startsWith("#"));
  if (!lines.length) throw new Error("Empty CSV.");

  const header = lines[0].split(",").map((h) => h.trim().toLowerCase().replace(/[\s-]/g, "_"));
  const hasHeader = header.some((h) =>
    ["symbol", "ticker", "qty", "quantity", "shares", "avg_price", "avgprice", "cost"].includes(h),
  );
  const rows = (hasHeader ? lines.slice(1) : lines).map((line) => line.split(",").map((c) => c.trim()));

  const idx = (names: string[], fallback: number) => {
    const i = header.findIndex((h) => names.includes(h));
    return i >= 0 ? i : fallback;
  };

  const iSym = hasHeader ? idx(["symbol", "ticker", "name"], 0) : 0;
  const iQty = hasHeader ? idx(["qty", "quantity", "shares", "size"], 1) : 1;
  const iPx = hasHeader ? idx(["avg_price", "avgprice", "price", "cost", "avg"], 2) : 2;
  const iNote = hasHeader ? idx(["note", "memo", "tag"], 3) : 3;

  const lots: HoldingLot[] = [];
  let cashUsdt = 0;

  for (const cols of rows) {
    if (!cols[iSym]) continue;
    const key = cols[iSym].replace(/\s/g, "").toUpperCase();
    const mapped = SYM_MAP[key];
    if (!mapped) continue;
    const q = Number(cols[iQty] ?? 0);
    const px = Number(cols[iPx] ?? 0);
    if (!Number.isFinite(q) || q === 0) continue;
    if (mapped === "CASH") {
      cashUsdt += q;
      continue;
    }
    lots.push({
      symbol: mapped,
      qty: q,
      avgPrice: Number.isFinite(px) && px > 0 ? px : BASE_PRICES[mapped],
      note: cols[iNote] || undefined,
    });
  }

  if (!lots.length && cashUsdt === 0) {
    throw new Error("CSV had no rToken rows. Use rAAPL, rNVDA, rTSLA, rMSFT, rAMZN, plus optional USDT cash.");
  }

  return { name, cashUsdt, lots, source: name === SAMPLE_BOOK_NAME ? "template" : "csv", raw };
}

export function sampleBook(): BookFile {
  return { ...parseHoldingsCsv(SAMPLE_CSV, SAMPLE_BOOK_NAME), source: "template" };
}

export function bookToAccount(book: BookFile, ts = Date.now()): PaperAccount {
  const quotes = bookQuotes(ts);
  let cash = book.cashUsdt;
  const base = emptyAccount(Math.max(cash, 1));
  base.cashUsdt = cash;
  base.startingCash = cash + book.lots.reduce((s, l) => s + l.qty * l.avgPrice, 0);
  base.positions = book.lots.map((l) => ({
    symbol: l.symbol,
    qty: l.qty,
    avgPrice: l.avgPrice,
    marketValue: l.qty * (quotes.find((q) => q.symbol === l.symbol)?.mid ?? l.avgPrice),
    unrealizedPnl: 0,
  }));
  const marked = markAccount(base, quotes);
  marked.startingCash = marked.equityUsdt;
  marked.dayPnl = 0;
  marked.highWater = marked.equityUsdt;
  marked.drawdownPct = 0;
  return marked;
}

export function csvTemplate(): string {
  return [
    "symbol,qty,avg_price,note",
    ...UNIVERSE.map((u) => `${u.symbol},0,${BASE_PRICES[u.symbol].toFixed(2)},`),
    "USDT,0,1.00,cash sleeve",
  ].join("\n");
}

export function knownSymbols(): SymbolCode[] {
  return SYMBOLS.slice();
}

export function instrumentLine(symbol: SymbolCode): string {
  const i = getInstrument(symbol);
  return `${i.symbol} · ${i.underlying} · ${i.name}`;
}
