"use client";

import { ClockPair } from "./clocks";
import { Metric, Panel, Pill } from "./panel";
import { PageFrame } from "./frame";
import { PriceChart } from "./price-chart";
import { useDesk } from "./desk-context";
import { cls, pct, usdt } from "@/lib/format";
import { receiptLine } from "@/lib/agents/receipt";

export function DeskBoard() {
  const d = useDesk();

  return (
    <PageFrame
      kicker="Desk"
      title="Overnight book"
      lede="Import a Bitget rToken holdings CSV. Research, sentiment, risk, and execution each close with a sized action and a receipt. Submit once. Cancel-on-anomaly stays live until fill."
      extra={<ClockPair />}
    >
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <label className="btn-primary cursor-pointer px-3 py-2 text-[12px]">
          Import holdings CSV
          <input
            type="file"
            accept=".csv,text/csv"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (!f) return;
              f.text().then((t) => void d.loadCsv(t, f.name));
            }}
          />
        </label>
        <a href="/books/holdings.template.csv" className="btn-ghost px-3 py-2 text-[12px] text-mute hover:text-ink">
          CSV template
        </a>
        <button
          type="button"
          onClick={d.runCycleNow}
          disabled={!d.book || d.phase === "watching" || d.phase === "arming"}
          className="btn-ghost px-3 py-2 text-[12px] disabled:opacity-40"
        >
          Run desk cycle
        </button>
        <button
          type="button"
          onClick={() => d.setKillSwitch(!d.killSwitch)}
          className={cls(
            "rounded-xl px-3 py-2 text-[12px]",
            d.killSwitch ? "bg-loss/20 text-loss" : "btn-ghost text-mute",
          )}
        >
          Kill switch {d.killSwitch ? "ON" : "off"}
        </button>
        <button type="button" onClick={() => void d.clearDesk()} className="px-3 py-2 text-[12px] text-faint">
          Clear ledger
        </button>
        <Pill tone={phaseTone(d.phase)}>{d.phase}</Pill>
      </div>

      {d.error && <p className="mb-4 text-[13px] text-loss">{d.error}</p>}

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-4 min-w-0">
          <PriceChart />

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {(["research", "sentiment", "risk", "execution"] as const).map((id) => (
              <AgentTile key={id} id={id} phase={d.phase} />
            ))}
          </div>

          <Panel kicker="Holdings" title={d.book?.name ?? "No book loaded"} glow={!!d.book}>
            {!d.book ? (
              <div className="space-y-3 text-[13px] text-mute">
                <p>
                  Expected columns: <span className="text-ink">symbol, qty, avg_price, note</span>.
                  Symbols: rAAPL, rNVDA, rTSLA, rMSFT, rAMZN, plus USDT cash.
                </p>
                <p>
                  Ledger persists to <span className="text-ink">data/ledger</span> on the server and
                  local storage on this browser.
                </p>
              </div>
            ) : (
              <div className="space-y-2 text-[12px]">
                {d.book.lots.map((l) => (
                  <div key={l.symbol} className="flex justify-between gap-3">
                    <span className="text-ink">{l.symbol}</span>
                    <span className="tabular text-mute">
                      {l.qty} @ {l.avgPrice.toFixed(2)}
                    </span>
                  </div>
                ))}
                <div className="flex justify-between border-t border-line pt-2">
                  <span className="text-faint">USDT cash</span>
                  <span className="tabular">{d.book.cashUsdt.toFixed(0)}</span>
                </div>
                {d.account && (
                  <div className="flex justify-between">
                    <span className="text-faint">Marked equity</span>
                    <span className="tabular text-ink">{usdt(d.account.equityUsdt, 0)}</span>
                  </div>
                )}
              </div>
            )}
          </Panel>

          {d.cycles.length > 0 && (
            <Panel kicker="Receipts" title="Every name closes as a sized action" glow>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-[12px]">
                  <thead className="text-faint">
                    <tr>
                      {["Name", "Research", "Sentiment", "Risk", "Action", "Receipt"].map((h) => (
                        <th key={h} className="pb-2 font-medium tracking-wide">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {d.cycles.map((c) => (
                      <tr key={c.symbol} className="border-t border-line">
                        <td className="py-2 text-ink">{c.symbol}</td>
                        <td className="py-2 text-mute">
                          {c.research.bias} · {c.research.confidence.toFixed(2)}
                        </td>
                        <td className="py-2 text-mute">
                          {c.sentiment.score.toFixed(0)} {c.sentiment.heat}
                        </td>
                        <td className="py-2">
                          <Pill
                            tone={
                              c.risk.verdict === "block"
                                ? "loss"
                                : c.risk.verdict === "warn"
                                  ? "warn"
                                  : "gain"
                            }
                          >
                            {c.risk.verdict}
                          </Pill>
                        </td>
                        <td
                          className={cls(
                            "py-2 tabular font-medium",
                            c.receipt.kind === "buy"
                              ? "text-gain"
                              : c.receipt.kind === "sell"
                                ? "text-loss"
                                : "text-ink",
                          )}
                        >
                          {c.receipt.kind.toUpperCase()} {c.receipt.qty}
                        </td>
                        <td className="py-2 tabular text-accent">{c.receipt.hash}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Panel>
          )}
        </div>

        {/* Right order / risk panel */}
        <aside className="space-y-4 xl:sticky xl:top-[88px] xl:self-start">
          {d.plan ? (
            <>
              <Panel
                kicker="Order"
                title="Risk-gated rebalance"
                glow
                action={
                  d.phase === "arming" ? (
                    <span className="tabular text-accent">{(d.remainingMs / 1000).toFixed(1)}s</span>
                  ) : null
                }
              >
                <p className="mb-3 text-[12px] leading-5 text-mute">{d.plan.summary}</p>
                <div className="space-y-2">
                  {d.plan.legs.map((leg) => (
                    <div
                      key={leg.symbol}
                      className="rounded-xl border border-line bg-bg/40 px-3 py-2 text-[12px]"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span
                          className={cls(
                            "font-medium tabular",
                            leg.side === "buy" ? "text-gain" : "text-loss",
                          )}
                        >
                          {leg.side.toUpperCase()} {leg.qty} {leg.symbol}
                        </span>
                        <span className="tabular text-faint">
                          {leg.fromQty} → {leg.toQty}
                        </span>
                      </div>
                      <div className="mt-1 tabular text-accent">{leg.receipt.hash}</div>
                      <div className="mt-1 text-[11px] text-mute">{leg.reason}</div>
                    </div>
                  ))}
                  {d.plan.blocked.map((leg) => (
                    <div key={leg.symbol} className="text-[12px] text-loss">
                      BLOCKED {leg.symbol}: {leg.reason}
                    </div>
                  ))}
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={d.submitPlan}
                    disabled={d.phase === "arming" || d.plan.legs.length === 0 || d.phase === "filled"}
                    className="btn-primary px-4 py-2 text-[13px] disabled:opacity-40"
                  >
                    {d.phase === "arming" ? "Armed · cancel-on-anomaly" : "Submit order"}
                  </button>
                  <button type="button" onClick={d.cancel} className="btn-ghost px-4 py-2 text-[13px] text-mute">
                    Cancel
                  </button>
                </div>
                {d.phase === "arming" && (
                  <div className="mt-3 h-1 overflow-hidden rounded-full bg-line">
                    <div
                      className="h-full rounded-full bg-accent transition-[width] duration-200"
                      style={{ width: `${(d.remainingMs / 8000) * 100}%` }}
                    />
                  </div>
                )}
                {d.phase === "cancelled" && (
                  <p className="mt-3 text-[12px] text-loss">
                    Cancelled. {d.anomalies.length ? d.anomalies.join(", ") : "Operator halt."} No fill.
                  </p>
                )}
                {d.phase === "filled" && (
                  <p className="mt-3 text-[12px] text-gain">
                    Filled. {d.fills.length} tickets on the blotter. Ledger updated.
                  </p>
                )}
              </Panel>

              <Panel kicker="Impact" title="Overnight exposure">
                <div className="grid gap-4">
                  <Metric label="Hours uncovered" value={`${d.plan.impact.hoursSaved}`} tone="accent" />
                  <Metric
                    label="Fees avoided vs panic"
                    value={usdt(d.plan.impact.feeAvoidedUsdt, 0)}
                    hint={`Panic ${usdt(d.plan.impact.panicFeeUsdt, 0)} · gated ${usdt(d.plan.impact.gatedFeeUsdt, 0)}`}
                    tone="gain"
                  />
                  <Metric
                    label="Overnight gap"
                    value={pct(d.plan.impact.overnightGapPct)}
                    hint={usdt(d.plan.impact.overnightGapUsdt, 0)}
                    tone="loss"
                  />
                </div>
              </Panel>
            </>
          ) : (
            <Panel kicker="Order" title="Awaiting proposal" glow>
              <p className="text-[12px] leading-5 text-mute">
                Import a book and run a desk cycle. The right rail will hold the risk-gated ticket,
                preview timer, and overnight impact.
              </p>
            </Panel>
          )}

          {d.account && d.phase === "filled" && (
            <Panel kicker="Ledger" title="Marked account">
              <div className="grid gap-4">
                <Metric label="Equity" value={usdt(d.account.equityUsdt)} />
                <Metric label="Cash" value={usdt(d.account.cashUsdt)} />
                <Metric
                  label="Unrealized"
                  value={usdt(d.account.unrealizedPnl)}
                  tone={d.account.unrealizedPnl >= 0 ? "gain" : "loss"}
                />
                <Metric
                  label="Realized"
                  value={usdt(d.account.realizedPnl)}
                  tone={d.account.realizedPnl >= 0 ? "gain" : "loss"}
                />
              </div>
            </Panel>
          )}
        </aside>
      </div>

      {d.cycles[0] && (
        <p className="mt-4 text-[11px] text-faint">{receiptLine(d.cycles[0].receipt)}</p>
      )}
    </PageFrame>
  );
}

function phaseTone(phase: string): "gain" | "loss" | "accent" | "mute" | "warn" | "blue" {
  if (phase === "filled") return "gain";
  if (phase === "cancelled") return "loss";
  if (phase === "arming" || phase === "watching") return "accent";
  if (phase === "proposed") return "blue";
  return "mute";
}

function AgentTile({
  id,
  phase,
}: {
  id: "research" | "sentiment" | "risk" | "execution";
  phase: string;
}) {
  const running = phase === "watching";
  const ready = ["proposed", "arming", "filled", "cancelled"].includes(phase);
  return (
    <div
      className={cls(
        "rounded-[14px] border border-line bg-surface p-4",
        ready && "card-glow",
      )}
    >
      <div className="flex items-center justify-between">
        <div className="text-[12px] font-medium capitalize tracking-tight text-ink">{id}</div>
        <span
          className={cls(
            "h-1.5 w-1.5 rounded-full",
            running ? "pulse-dot bg-accent" : ready ? "bg-gain" : "bg-faint",
          )}
        />
      </div>
      <p className="mt-2 text-[12px] leading-5 text-mute">
        {id === "research" && "Emits buy, sell, or hold with confidence and horizon."}
        {id === "sentiment" && "Confirms or cuts size from overnight heat."}
        {id === "risk" && "Twelve rules. Output is max qty or block."}
        {id === "execution" && "Arms the ticket, cancels on anomaly, stamps the receipt."}
      </p>
    </div>
  );
}
