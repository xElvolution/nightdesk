"use client";

import { PageFrame } from "@/components/frame";
import { Panel, Pill } from "@/components/panel";
import { useDesk } from "@/components/desk-context";
import { usdt } from "@/lib/format";

export default function OrdersPage() {
  const d = useDesk();
  const legs = d.plan?.legs ?? [];

  return (
    <PageFrame
      kicker="Orders"
      title="Preview and cancel-on-anomaly"
      lede="Orders arm for 8 seconds. If the rToken spread blows out, the quote goes stale, sentiment flips, or the kill switch trips, the desk cancels. There is no silent fill."
      extra={
        <button
          type="button"
          onClick={d.submitPlan}
          disabled={!d.plan || d.phase === "arming" || d.phase === "filled" || d.phase === "empty" || d.phase === "loaded" || d.phase === "watching"}
          className="btn-primary px-4 py-2 text-[13px] disabled:opacity-40"
        >
          {legs.length ? "Submit order" : "Confirm holds"}
        </button>
      }
    >
      {!d.plan ? (
        <Panel>
          <p className="text-[13px] text-mute">
            No proposal yet. Import a book on the desk and run a desk cycle. Every name still
            prints a hold receipt even when the desk stays flat.
          </p>
        </Panel>
      ) : (
        <div className="grid gap-3">
          {!legs.length && (
            <Panel title="Hold receipts">
              <p className="mb-3 text-[12px] text-mute">
                No trade size tonight. Confirm holds to seal the night proof.
              </p>
              <div className="space-y-2">
                {d.plan.receipts.map((r) => (
                  <div key={r.id} className="flex justify-between gap-2 text-[12px]">
                    <span className="text-ink">
                      {r.kind.toUpperCase()} {r.qty} {r.symbol}
                    </span>
                    <span className="tabular text-accent">{r.hash}</span>
                  </div>
                ))}
              </div>
              <p className="mt-3 font-mono text-[11px] text-faint">Night proof {d.plan.bundleHash}</p>
            </Panel>
          )}
          {d.phase === "arming" && (
            <Panel>
              <div className="text-[12px] text-accent">
                Preview live · {(d.remainingMs / 1000).toFixed(1)}s · cancel-on-anomaly on
              </div>
              <div className="mt-2 h-1 overflow-hidden rounded bg-line">
                <div className="h-full bg-accent" style={{ width: `${(d.remainingMs / 8000) * 100}%` }} />
              </div>
            </Panel>
          )}
          {legs.map((leg) => (
            <Panel key={leg.symbol} title={`${leg.side.toUpperCase()} ${leg.qty} ${leg.symbol}`}>
              <div className="grid gap-3 sm:grid-cols-4 text-[12px]">
                <div>
                  <div className="text-faint">Limit</div>
                  <div className="tabular text-ink">{leg.limitPrice.toFixed(2)}</div>
                </div>
                <div>
                  <div className="text-faint">Notional</div>
                  <div className="tabular">{usdt(leg.notional)}</div>
                </div>
                <div>
                  <div className="text-faint">Risk</div>
                  <Pill
                    tone={
                      leg.risk.verdict === "block"
                        ? "loss"
                        : leg.risk.verdict === "warn"
                          ? "warn"
                          : "gain"
                    }
                  >
                    {leg.risk.verdict}
                  </Pill>
                </div>
                <div>
                  <div className="text-faint">Receipt</div>
                  <div className="tabular text-accent">{leg.receipt.hash}</div>
                </div>
              </div>
              <p className="mt-3 text-[12px] text-mute">{leg.reason}</p>
              {leg.anomalies.length > 0 && (
                <p className="mt-2 text-[12px] text-loss">Anomaly: {leg.anomalies.join(", ")}</p>
              )}
            </Panel>
          ))}
        </div>
      )}
    </PageFrame>
  );
}
