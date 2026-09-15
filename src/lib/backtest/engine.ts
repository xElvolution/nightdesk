import { history } from "../market/history";
import { STARTING_CASH, UNIVERSE } from "../universe";
import { hashSeed, mulberry32 } from "../prng";
import type { BacktestReport, BacktestTrade, SymbolCode } from "../types";

export interface BacktestRequest {
  from?: string;
  to?: string;
  symbols?: SymbolCode[];
  startingCash?: number;
}

export function runBacktest(req: BacktestRequest = {}): BacktestReport {
  const symbols = req.symbols ?? UNIVERSE.map((u) => u.symbol);
  const cash0 = req.startingCash ?? STARTING_CASH;
  const days = 90;
  const series = Object.fromEntries(symbols.map((s) => [s, history(s, days)])) as Record<
    SymbolCode,
    ReturnType<typeof history>
  >;
  const dates = series[symbols[0]].map((b) => b.t);
  const from = req.from ?? dates[0];
  const to = req.to ?? dates[dates.length - 1];
  const window = dates.filter((d) => d >= from && d <= to);

  let cash = cash0;
  let peak = cash0;
  let maxDd = 0;
  const curve: { t: string; equity: number }[] = [];
  const tradesList: BacktestTrade[] = [];
  const pnls: number[] = [];

  for (const day of window) {
    let dayPnl = 0;
    for (const symbol of symbols) {
      const bars = series[symbol];
      const i = bars.findIndex((b) => b.t === day);
      if (i < 1) continue;
      const prev = bars[i - 1];
      const bar = bars[i];
      const overnight = bar.overnightRet;
      const rand = mulberry32(hashSeed(`bt:${symbol}:${day}`));
      const sent = overnight * 900 + (rand() - 0.5) * 40;
      const conf = Math.min(0.9, 0.4 + Math.abs(overnight) * 12);
      const aligned = Math.abs(sent) >= 18 && conf >= 0.42;
      if (!aligned) continue;

      const fade = Math.abs(overnight) > 0.012;
      const side = fade ? (overnight > 0 ? "sell" : "buy") : sent > 0 ? "buy" : "sell";
      const equity = cash;
      const px = prev.close;
      let qty = Math.floor((equity * 0.06 * conf) / px);
      if (qty < 1) continue;
      if (qty * px > equity * 0.12) qty = Math.floor((equity * 0.12) / px);
      if (qty < 1) continue;

      const spreadBlow = rand() < 0.06;
      const stale = rand() < 0.03;
      if (spreadBlow || stale) {
        tradesList.push({
          session: day,
          symbol,
          side,
          qty,
          entry: px,
          exit: px,
          pnl: 0,
          holdHours: 0,
          cancelled: true,
          cancelReason: spreadBlow ? "spread_blowout" : "quote_stale",
        });
        continue;
      }

      const entry = side === "buy" ? px * 1.0004 : px * 0.9996;
      const exit = bar.open;
      const pnl =
        side === "buy" ? (exit - entry) * qty - entry * qty * 0.0004 : (entry - exit) * qty - entry * qty * 0.0004;
      cash += pnl;
      dayPnl += pnl;
      tradesList.push({
        session: day,
        symbol,
        side,
        qty,
        entry: Number(entry.toFixed(2)),
        exit: Number(exit.toFixed(2)),
        pnl: Number(pnl.toFixed(2)),
        holdHours: 17.5,
        cancelled: false,
      });
    }
    pnls.push(dayPnl);
    peak = Math.max(peak, cash);
    maxDd = Math.max(maxDd, peak === 0 ? 0 : ((peak - cash) / peak) * 100);
    curve.push({ t: day, equity: Number(cash.toFixed(2)) });
  }

  const closed = tradesList.filter((t) => !t.cancelled);
  const wins = closed.filter((t) => t.pnl > 0).length;
  const losses = closed.filter((t) => t.pnl <= 0).length;
  const mean = pnls.length ? pnls.reduce((a, b) => a + b, 0) / pnls.length : 0;
  const var_ =
    pnls.length > 1
      ? pnls.reduce((s, x) => s + (x - mean) ** 2, 0) / (pnls.length - 1)
      : 0;
  const sharpe = var_ > 0 ? (mean / Math.sqrt(var_)) * Math.sqrt(252) : 0;
  const cancels = tradesList.filter((t) => t.cancelled).length;

  return {
    id: `bt_${from}_${to}`,
    strategy: "Overnight rToken desk: fade >1.2% gaps, follow aligned sentiment otherwise, cancel on spread or stale quote.",
    from,
    to,
    startingCash: cash0,
    endingEquity: Number(cash.toFixed(2)),
    pnl: Number((cash - cash0).toFixed(2)),
    pnlPct: Number((((cash - cash0) / cash0) * 100).toFixed(2)),
    trades: tradesList.length,
    wins,
    losses,
    winRate: closed.length ? Number(((wins / closed.length) * 100).toFixed(1)) : 0,
    maxDrawdownPct: Number(maxDd.toFixed(2)),
    sharpe: Number(sharpe.toFixed(2)),
    cancelRate: tradesList.length ? Number(((cancels / tradesList.length) * 100).toFixed(1)) : 0,
    exposureHours: closed.length * 17.5,
    curve,
    tradesList,
    notes: [
      "Seeded path, not live Bitget fills. Re-run with the same window to reproduce.",
      "Entry is prior cash close. Exit is next cash open. Fees 4 bps round trip.",
      "Cancel-on-anomaly fires on simulated spread blowouts and stale quotes.",
      "rTSLA earnings blackout is enforced in the live desk, not in this path replay.",
    ],
  };
}
