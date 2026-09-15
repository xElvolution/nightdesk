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
          disabled={!legs.length || d.phase === "arming" || d.phase === "filled"}
          className="rounded-lg bg-amber px-4 py-2 text-[13px] font-medium text-bg disabled:opacity-40"
        >
          Submit order
        </button>
      }
    >
      {!legs.length ? (
        <Panel>
          <p className="text-[13px] text-mute">
            No proposal yet. Import a book on the desk and run a desk cycle. Every name still
            prints a hold receipt even when the desk stays flat.
          </p>
        </Panel>
      ) : (
        <div className="grid gap-3">
          {d.phase === "arming" && (
            <Panel>
              <div className="text-[12px] text-amber">
                Preview live · {(d.remainingMs / 1000).toFixed(1)}s · cancel-on-anomaly on
              </div>
              <div className="mt-2 h-1 overflow-hidden rounded bg-line">
                <div className="h-full bg-amber" style={{ width: `${(d.remainingMs / 8000) * 100}%` }} />
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
                  <div className="tabular text-amber">{leg.receipt.hash}</div>
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
