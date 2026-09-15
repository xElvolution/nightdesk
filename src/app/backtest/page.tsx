"use client";

import { useMemo, useState } from "react";
import { PageFrame } from "@/components/frame";
import { Metric, Panel, Pill } from "@/components/panel";
import { EquityChart } from "@/components/spark";
import { runBacktest } from "@/lib/backtest/engine";
import { pct, usdt, pnlClass } from "@/lib/format";
import type { BacktestReport, SymbolCode } from "@/lib/types";
import { SYMBOLS } from "@/lib/universe";

export default function BacktestPage() {
  const [symbols, setSymbols] = useState<SymbolCode[]>([...SYMBOLS]);
  const [report, setReport] = useState<BacktestReport | null>(null);

  const preview = useMemo(() => runBacktest({ symbols }), [symbols]);

  function run() {
    setReport(runBacktest({ symbols }));
  }

  const r = report ?? preview;

  return (
    <PageFrame
      kicker="Backtest"
      title="Overnight rToken path"
      lede="Prior cash close to next cash open. Fade gaps larger than 1.2%. Follow aligned sentiment otherwise. Cancel on simulated spread blowouts and stale quotes. Seeded path. Re-run the same window to reproduce."
      extra={
        <button
          type="button"
          onClick={run}
          className="rounded-lg bg-amber px-4 py-2 text-[13px] font-medium text-bg"
        >
          Run path
        </button>
      }
    >
      <div className="mb-4 flex flex-wrap gap-2">
        {SYMBOLS.map((s) => {
          const on = symbols.includes(s);
          return (
            <button
              key={s}
              type="button"
              onClick={() =>
                setSymbols((cur) => (on ? cur.filter((x) => x !== s) : [...cur, s]))
              }
              className={
                on
                  ? "rounded-md bg-panel2 px-2 py-1 text-[11px] text-ink"
                  : "rounded-md px-2 py-1 text-[11px] text-faint"
              }
            >
              {s}
            </button>
          );
        })}
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Panel>
          <Metric label="PnL" value={usdt(r.pnl)} tone={r.pnl >= 0 ? "gain" : "loss"} />
        </Panel>
        <Panel>
          <Metric label="Sharpe" value={r.sharpe.toFixed(2)} />
        </Panel>
        <Panel>
          <Metric label="Max DD" value={`${r.maxDrawdownPct.toFixed(2)}%`} tone="loss" />
        </Panel>
        <Panel>
          <Metric
            label="Win / cancel"
            value={`${r.winRate.toFixed(0)}% / ${r.cancelRate.toFixed(0)}%`}
            hint={`${r.trades} tickets`}
          />
        </Panel>
      </div>

      <Panel title="Equity" className="mt-4">
        <EquityChart curve={r.curve} />
        <div className="mt-2 flex justify-between text-[11px] text-faint">
          <span>{r.from}</span>
          <span className={pnlClass(r.pnl)}>{pct(r.pnlPct)}</span>
          <span>{r.to}</span>
        </div>
      </Panel>

      <Panel title="Notes" className="mt-4">
        <ul className="list-disc space-y-1 pl-4 text-[12px] text-mute">
          {r.notes.map((n) => (
            <li key={n}>{n}</li>
          ))}
        </ul>
        <p className="mt-3 text-[12px] text-faint">{r.strategy}</p>
      </Panel>

      <Panel title="Trades" className="mt-4">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-[12px]">
            <thead className="text-faint">
              <tr>
                {["Session", "Name", "Side", "Qty", "Entry", "Exit", "PnL", "Status"].map((h) => (
                  <th key={h} className="pb-2 font-medium">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {r.tradesList.slice(-40).reverse().map((t, i) => (
                <tr key={`${t.session}-${t.symbol}-${i}`} className="border-t border-line">
                  <td className="py-2 tabular text-mute">{t.session}</td>
                  <td className="py-2">{t.symbol}</td>
                  <td className="py-2">{t.side}</td>
                  <td className="py-2 tabular">{t.qty}</td>
                  <td className="py-2 tabular">{t.entry.toFixed(2)}</td>
                  <td className="py-2 tabular">{t.exit.toFixed(2)}</td>
                  <td className={`py-2 tabular ${pnlClass(t.pnl)}`}>{t.pnl.toFixed(2)}</td>
                  <td className="py-2">
                    <Pill tone={t.cancelled ? "loss" : t.pnl >= 0 ? "gain" : "mute"}>
                      {t.cancelled ? t.cancelReason ?? "cancel" : "fill"}
                    </Pill>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
    </PageFrame>
  );
}
