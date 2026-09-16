"use client";

import { PageFrame } from "@/components/frame";
import { Metric, Panel, Pill } from "@/components/panel";
import { useDesk } from "@/components/desk-context";
import { usdt, pnlClass } from "@/lib/format";
import { formatLagos } from "@/lib/clock";

export default function BlotterPage() {
  const d = useDesk();
  const acc = d.account;

  return (
    <PageFrame
      kicker="Blotter"
      title="Order blotter"
      lede="Fills on rAAPL, rNVDA, rTSLA, rMSFT, rAMZN at 4 bps. Venue adapter routes live Bitget when reachable, recorded tape otherwise. Timestamp, name, side, price, qty, fee, receipt id."
    >
      {acc ? (
        <div className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Panel>
            <Metric label="Equity" value={usdt(acc.equityUsdt)} />
          </Panel>
          <Panel>
            <Metric label="Cash" value={usdt(acc.cashUsdt)} />
          </Panel>
          <Panel>
            <Metric
              label="Unrealized"
              value={usdt(acc.unrealizedPnl)}
              tone={acc.unrealizedPnl >= 0 ? "gain" : "loss"}
            />
          </Panel>
          <Panel>
            <Metric
              label="Drawdown"
              value={`${acc.drawdownPct.toFixed(2)}%`}
              tone={acc.drawdownPct > 0 ? "loss" : "mute"}
            />
          </Panel>
        </div>
      ) : (
        <Panel>
          <p className="text-[13px] text-mute">Import a book on the desk to mark the account.</p>
        </Panel>
      )}

      <Panel title="Positions">
        {!acc?.positions.length ? (
          <p className="text-[13px] text-mute">No open lots.</p>
        ) : (
          <table className="w-full text-left text-[12px]">
            <thead className="text-faint">
              <tr>
                {["Symbol", "Qty", "Avg", "Mark value", "UPnL"].map((h) => (
                  <th key={h} className="pb-2 font-medium">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {acc.positions.map((p) => (
                <tr key={p.symbol} className="border-t border-line">
                  <td className="py-2 text-ink">{p.symbol}</td>
                  <td className="py-2 tabular">{p.qty}</td>
                  <td className="py-2 tabular">{p.avgPrice.toFixed(2)}</td>
                  <td className="py-2 tabular">{usdt(p.marketValue)}</td>
                  <td className={`py-2 tabular ${pnlClass(p.unrealizedPnl)}`}>
                    {usdt(p.unrealizedPnl)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Panel>

      <Panel title="Fills" className="mt-4">
        {!d.fills.length ? (
          <p className="text-[13px] text-mute">
            No fills yet. Submit an order on the desk. Each fill is a receipt on this blotter.
          </p>
        ) : (
          <table className="w-full text-left text-[12px]">
            <thead className="text-faint">
              <tr>
                {["Lagos", "Symbol", "Side", "Qty", "Price", "Notional", "Fee", "Receipt"].map((h) => (
                  <th key={h} className="pb-2 font-medium">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {d.fills.map((f) => (
                <tr key={f.id} className="border-t border-line">
                  <td className="py-2 tabular text-mute">{formatLagos(f.ts)}</td>
                  <td className="py-2">{f.symbol}</td>
                  <td className="py-2">
                    <Pill tone={f.side === "buy" ? "gain" : "loss"}>{f.side}</Pill>
                  </td>
                  <td className="py-2 tabular">{f.qty}</td>
                  <td className="py-2 tabular">{f.price.toFixed(2)}</td>
                  <td className="py-2 tabular">{usdt(f.notional)}</td>
                  <td className="py-2 tabular text-mute">{usdt(f.feeUsdt)}</td>
                  <td className="py-2 font-mono text-[10px] text-faint">{f.receiptHash ?? f.id}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Panel>
    </PageFrame>
  );
}
