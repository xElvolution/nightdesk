"use client";

import Link from "next/link";
import { useMemo } from "react";
import { ClockPair } from "./clocks";
import { Pill } from "./panel";
import { useDesk } from "./desk-context";
import { useOperator } from "./operator-context";
import { cls, usdt } from "@/lib/format";
import type { RebalanceLeg } from "@/lib/types";

type FlowStep = "book" | "run" | "review" | "submit" | "receipts";

const STEPS: { id: FlowStep; label: string; hint: string }[] = [
  { id: "book", label: "Book", hint: "See your holdings" },
  { id: "run", label: "Run night", hint: "One button" },
  { id: "review", label: "Review", hint: "Plain actions" },
  { id: "submit", label: "Submit", hint: "One rebalance" },
  { id: "receipts", label: "Receipts", hint: "What filled" },
];

export function DeskBoard() {
  const d = useDesk();
  const { operator } = useOperator();
  const active = activeStep(d.phase, !!d.book);
  const doneThrough = doneThroughStep(d.phase, !!d.book);

  const actionLines = useMemo(() => {
    if (!d.plan) return [];
    return d.plan.legs.map(plainLeg);
  }, [d.plan]);

  const nextCta = primaryCta(d);

  return (
    <div className="px-4 py-5 sm:px-5 lg:px-6">
      <header className="mb-5 flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0 max-w-xl">
          <div className="label text-accent">Tonight</div>
          <h1 className="mt-1 text-[26px] font-semibold tracking-tight text-ink sm:text-[28px]">
            {operator ? `${operator.displayName}'s overnight` : "Your overnight"}
          </h1>
          <p className="mt-2 text-[14px] leading-6 text-mute">
            One job: check your book, run the night, review the moves, submit once, keep the receipts.
          </p>
          {operator && (
            <p className="mt-2 text-[12px] text-faint">
              Signed in as @{operator.handle}
            </p>
          )}
        </div>
        <div className="flex flex-col items-end gap-2">
          <ClockPair />
          <Pill tone={phaseTone(d.phase)}>{plainPhase(d.phase)}</Pill>
        </div>
      </header>

      <StepRail active={active} doneThrough={doneThrough} />

      {d.error && (
        <p className="mb-4 rounded-xl border border-loss/30 bg-loss/10 px-3 py-2 text-[13px] text-loss">
          {d.error}
        </p>
      )}

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(280px,360px)]">
        <div className="space-y-4 min-w-0">
          <BookCard
            book={d.book}
            account={d.account}
            onImport={(raw, name) => void d.loadCsv(raw, name)}
          />

          {(d.phase === "proposed" ||
            d.phase === "arming" ||
            d.phase === "filled" ||
            d.phase === "cancelled") &&
            d.plan && (
              <ReviewCard
                lines={actionLines}
                blocked={d.plan.blocked}
                summary={d.plan.summary}
                phase={d.phase}
              />
            )}

          {(d.phase === "filled" || (d.fills.length > 0 && d.phase !== "empty")) && (
            <ReceiptsCard fills={d.fills} cycles={d.cycles} phase={d.phase} />
          )}
        </div>

        <aside className="space-y-4 lg:sticky lg:top-[88px] lg:self-start">
          <ActionCard
            phase={d.phase}
            cta={nextCta}
            remainingMs={d.remainingMs}
            anomalies={d.anomalies}
            killSwitch={d.killSwitch}
            hasBook={!!d.book}
            hasLegs={!!d.plan && d.plan.legs.length > 0}
            onRun={d.runCycleNow}
            onSubmit={d.submitPlan}
            onCancel={d.cancel}
            onToggleKill={() => d.setKillSwitch(!d.killSwitch)}
            onClear={() => void d.clearDesk()}
          />

          <div className="rounded-xl border border-line bg-surface/60 px-4 py-3">
            <div className="label mb-2">More tools</div>
            <div className="flex flex-wrap gap-2 text-[12px]">
              <Link href="/orders" className="text-mute hover:text-ink">
                Orders
              </Link>
              <span className="text-faint">·</span>
              <Link href="/blotter" className="text-mute hover:text-ink">
                Blotter
              </Link>
              <span className="text-faint">·</span>
              <Link href="/risk" className="text-mute hover:text-ink">
                Risk
              </Link>
              <span className="text-faint">·</span>
              <Link href="/audit" className="text-mute hover:text-ink">
                Audit
              </Link>
            </div>
            <p className="mt-2 text-[11px] leading-4 text-faint">
              Optional. The desk above is the overnight path.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}

function StepRail({
  active,
  doneThrough,
}: {
  active: FlowStep;
  doneThrough: number;
}) {
  const activeIdx = STEPS.findIndex((s) => s.id === active);
  return (
    <ol className="flex gap-1 overflow-x-auto pb-1 sm:gap-2">
      {STEPS.map((step, i) => {
        const done = i <= doneThrough && i < activeIdx;
        const current = i === activeIdx;
        return (
          <li
            key={step.id}
            className={cls(
              "flex min-w-[108px] flex-1 flex-col rounded-xl border px-3 py-2.5",
              current
                ? "border-accent/40 bg-accent/10"
                : done
                  ? "border-gain/25 bg-gain/5"
                  : "border-line bg-surface/50",
            )}
          >
            <div className="flex items-center gap-2">
              <span
                className={cls(
                  "flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-semibold",
                  current
                    ? "bg-accent text-[#041018]"
                    : done
                      ? "bg-gain/20 text-gain"
                      : "bg-surface2 text-faint",
                )}
              >
                {done ? "✓" : i + 1}
              </span>
              <span
                className={cls(
                  "text-[12px] font-medium",
                  current ? "text-accent" : done ? "text-ink" : "text-mute",
                )}
              >
                {step.label}
              </span>
            </div>
            <span className="mt-1 pl-7 text-[11px] text-faint">{step.hint}</span>
          </li>
        );
      })}
    </ol>
  );
}

function BookCard({
  book,
  account,
  onImport,
}: {
  book: ReturnType<typeof useDesk>["book"];
  account: ReturnType<typeof useDesk>["account"];
  onImport: (raw: string, name: string) => void;
}) {
  return (
    <section className="rounded-[14px] border border-line bg-surface card-glow">
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-4 py-3">
        <div>
          <div className="label text-accent">Your book</div>
          <h2 className="text-[15px] font-medium tracking-tight text-ink">
            {book?.name ?? "No book yet"}
          </h2>
        </div>
        <label className="btn-ghost cursor-pointer px-3 py-1.5 text-[12px]">
          Import CSV
          <input
            type="file"
            accept=".csv,text/csv"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (!f) return;
              f.text().then((t) => onImport(t, f.name));
            }}
          />
        </label>
      </header>
      <div className="p-4">
        {!book ? (
          <div className="space-y-3 text-[13px] text-mute">
            <p>
              Your overnight book should appear here after you enter. If it is empty, import a holdings CSV.
            </p>
            <a
              href="/books/holdings.template.csv"
              className="inline-flex text-[12px] text-accent hover:underline"
            >
              Download CSV template
            </a>
          </div>
        ) : (
          <div className="space-y-2">
            {book.lots.map((l) => (
              <div
                key={l.symbol}
                className="flex items-center justify-between gap-3 rounded-lg border border-line/70 bg-bg/30 px-3 py-2.5"
              >
                <div>
                  <div className="text-[13px] font-medium text-ink">{l.symbol}</div>
                  {l.note && <div className="text-[11px] text-faint">{l.note}</div>}
                </div>
                <div className="text-right tabular text-[12px] text-mute">
                  <div>{l.qty} shares</div>
                  <div className="text-faint">avg {l.avgPrice.toFixed(2)}</div>
                </div>
              </div>
            ))}
            <div className="flex justify-between border-t border-line pt-3 text-[13px]">
              <span className="text-faint">Cash</span>
              <span className="tabular text-ink">{usdt(book.cashUsdt, 0)}</span>
            </div>
            {account && (
              <div className="flex justify-between text-[13px]">
                <span className="text-faint">Marked value</span>
                <span className="tabular text-ink">{usdt(account.equityUsdt, 0)}</span>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}

function ReviewCard({
  lines,
  blocked,
  summary,
  phase,
}: {
  lines: string[];
  blocked: RebalanceLeg[];
  summary: string;
  phase: string;
}) {
  return (
    <section className="rounded-[14px] border border-line bg-surface">
      <header className="border-b border-line px-4 py-3">
        <div className="label text-accent">Review</div>
        <h2 className="text-[15px] font-medium tracking-tight text-ink">
          {phase === "filled"
            ? "Moves that went through"
            : phase === "cancelled"
              ? "Moves that did not go through"
              : "Suggested overnight moves"}
        </h2>
        <p className="mt-1 text-[12px] leading-5 text-mute">{plainSummary(summary)}</p>
      </header>
      <div className="space-y-2 p-4">
        {lines.length === 0 ? (
          <p className="text-[13px] text-mute">
            No size changes tonight. Your book can stay as it is.
          </p>
        ) : (
          lines.map((line) => (
            <div
              key={line}
              className="rounded-xl border border-line bg-bg/40 px-3 py-3 text-[13px] leading-5 text-ink"
            >
              {line}
            </div>
          ))
        )}
        {blocked.map((leg) => (
          <div
            key={`b-${leg.symbol}`}
            className="rounded-xl border border-loss/25 bg-loss/5 px-3 py-3 text-[13px] text-loss"
          >
            Skipped {leg.symbol}: {leg.reason}
          </div>
        ))}
      </div>
    </section>
  );
}

function ReceiptsCard({
  fills,
  cycles,
  phase,
}: {
  fills: ReturnType<typeof useDesk>["fills"];
  cycles: ReturnType<typeof useDesk>["cycles"];
  phase: string;
}) {
  if (fills.length === 0 && cycles.length === 0) return null;
  return (
    <section className="rounded-[14px] border border-line bg-surface">
      <header className="border-b border-line px-4 py-3">
        <div className="label text-accent">Receipts</div>
        <h2 className="text-[15px] font-medium tracking-tight text-ink">
          {phase === "filled" ? "Night closed" : "Prior fills on this book"}
        </h2>
      </header>
      <div className="divide-y divide-line">
        {fills.slice(0, 12).map((f) => (
          <div
            key={f.id}
            className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 text-[13px]"
          >
            <span
              className={cls(
                "font-medium",
                f.side === "buy" ? "text-gain" : "text-loss",
              )}
            >
              {f.side === "buy" ? "Bought" : "Sold"} {f.qty} {f.symbol}
            </span>
            <span className="tabular text-mute">
              @ {f.price.toFixed(2)} · fee {f.feeUsdt.toFixed(2)}
            </span>
          </div>
        ))}
        {fills.length === 0 &&
          cycles.map((c) => (
            <div key={c.symbol} className="px-4 py-3 text-[13px] text-mute">
              {c.receipt.kind === "hold" || c.receipt.qty === 0
                ? `Hold ${c.symbol}`
                : `${c.receipt.kind === "buy" ? "Buy" : "Sell"} ${c.receipt.qty} ${c.symbol}`}
              <span className="ml-2 tabular text-faint">{c.receipt.hash.slice(0, 10)}</span>
            </div>
          ))}
      </div>
    </section>
  );
}

function ActionCard({
  phase,
  cta,
  remainingMs,
  anomalies,
  killSwitch,
  hasBook,
  hasLegs,
  onRun,
  onSubmit,
  onCancel,
  onToggleKill,
  onClear,
}: {
  phase: string;
  cta: { label: string; kind: "run" | "submit" | "wait" | "done" | "idle" };
  remainingMs: number;
  anomalies: string[];
  killSwitch: boolean;
  hasBook: boolean;
  hasLegs: boolean;
  onRun: () => void;
  onSubmit: () => void;
  onCancel: () => void;
  onToggleKill: () => void;
  onClear: () => void;
}) {
  const running = phase === "watching" || phase === "arming";
  return (
    <section className="rounded-[14px] border border-accent/25 bg-surface card-glow">
      <div className="border-b border-line px-4 py-3">
        <div className="label text-accent">Next</div>
        <h2 className="text-[15px] font-medium tracking-tight text-ink">
          {ctaHeadline(phase, hasBook)}
        </h2>
        <p className="mt-1 text-[12px] leading-5 text-mute">
          {ctaBody(phase, hasBook, hasLegs)}
        </p>
      </div>
      <div className="space-y-3 p-4">
        {cta.kind === "run" && (
          <button
            type="button"
            onClick={onRun}
            disabled={!hasBook || running}
            className="btn-primary w-full px-4 py-3 text-[14px] disabled:opacity-40"
          >
            Run overnight cycle
          </button>
        )}
        {cta.kind === "submit" && (
          <>
            <button
              type="button"
              onClick={onSubmit}
              disabled={!hasLegs || running}
              className="btn-primary w-full px-4 py-3 text-[14px] disabled:opacity-40"
            >
              Submit rebalance
            </button>
            <button
              type="button"
              onClick={onCancel}
              className="btn-ghost w-full px-4 py-2.5 text-[13px] text-mute"
            >
              Cancel
            </button>
          </>
        )}
        {cta.kind === "wait" && phase === "watching" && (
          <div className="rounded-xl border border-line bg-bg/40 px-3 py-4 text-center text-[13px] text-accent">
            Reading your book…
          </div>
        )}
        {cta.kind === "wait" && phase === "arming" && (
          <div className="space-y-2">
            <div className="rounded-xl border border-line bg-bg/40 px-3 py-4 text-center">
              <div className="text-[13px] text-accent">Sending order…</div>
              <div className="mt-1 tabular text-[20px] font-medium text-ink">
                {(remainingMs / 1000).toFixed(1)}s
              </div>
              <p className="mt-1 text-[11px] text-faint">
                Cancels automatically if the market looks wrong.
              </p>
            </div>
            <div className="h-1 overflow-hidden rounded-full bg-line">
              <div
                className="h-full rounded-full bg-accent transition-[width] duration-200"
                style={{ width: `${(remainingMs / 8000) * 100}%` }}
              />
            </div>
            <button
              type="button"
              onClick={onCancel}
              className="btn-ghost w-full px-4 py-2.5 text-[13px] text-mute"
            >
              Cancel now
            </button>
          </div>
        )}
        {cta.kind === "done" && (
          <div className="space-y-2">
            <div className="rounded-xl border border-gain/30 bg-gain/10 px-3 py-3 text-[13px] text-gain">
              Done. Receipts are on the left.
            </div>
            <button
              type="button"
              onClick={onRun}
              className="btn-primary w-full px-4 py-3 text-[14px]"
            >
              Run another night
            </button>
          </div>
        )}
        {cta.kind === "idle" && phase === "cancelled" && (
          <div className="space-y-2">
            <div className="rounded-xl border border-loss/30 bg-loss/10 px-3 py-3 text-[13px] text-loss">
              Cancelled
              {anomalies.length ? `: ${anomalies.join(", ")}` : ". Nothing filled."}
            </div>
            <button
              type="button"
              onClick={onRun}
              className="btn-primary w-full px-4 py-3 text-[14px]"
            >
              Run overnight cycle
            </button>
          </div>
        )}
        {cta.kind === "idle" && !hasBook && (
          <p className="text-[12px] text-faint">
            Import a CSV above, or enter again so your seeded book can load.
          </p>
        )}

        <div className="flex flex-wrap gap-2 border-t border-line pt-3">
          <button
            type="button"
            onClick={onToggleKill}
            className={cls(
              "rounded-lg px-2.5 py-1.5 text-[11px]",
              killSwitch ? "bg-loss/20 text-loss" : "text-faint hover:text-mute",
            )}
          >
            Halt {killSwitch ? "on" : "off"}
          </button>
          <button
            type="button"
            onClick={onClear}
            className="rounded-lg px-2.5 py-1.5 text-[11px] text-faint hover:text-mute"
          >
            Clear book
          </button>
        </div>
      </div>
    </section>
  );
}

function plainLeg(leg: RebalanceLeg): string {
  const verb = leg.side === "buy" ? "Buy" : "Sell";
  const why = leg.reason?.trim() || (leg.purpose === "de-risk" ? "Trim overnight risk" : "Add overnight size");
  return `${verb} ${leg.qty} ${leg.symbol} (${leg.fromQty} → ${leg.toQty}). ${why}`;
}

function plainSummary(summary: string): string {
  return summary
    .replace(/\s*—\s*/g, ". ")
    .replace(/\s*–\s*/g, ". ")
    .trim();
}

function activeStep(phase: string, hasBook: boolean): FlowStep {
  if (!hasBook || phase === "empty") return "book";
  if (phase === "loaded") return "run";
  if (phase === "watching") return "run";
  if (phase === "proposed" || phase === "cancelled") return "review";
  if (phase === "arming") return "submit";
  if (phase === "filled") return "receipts";
  return "book";
}

function doneThroughStep(phase: string, hasBook: boolean): number {
  if (!hasBook || phase === "empty") return -1;
  if (phase === "loaded" || phase === "watching") return 0;
  if (phase === "proposed" || phase === "cancelled") return 1;
  if (phase === "arming") return 2;
  if (phase === "filled") return 4;
  return 0;
}

function primaryCta(d: ReturnType<typeof useDesk>): {
  label: string;
  kind: "run" | "submit" | "wait" | "done" | "idle";
} {
  if (!d.book || d.phase === "empty") return { label: "Load book", kind: "idle" };
  if (d.phase === "watching" || d.phase === "arming") return { label: "Working…", kind: "wait" };
  if (d.phase === "proposed") return { label: "Submit rebalance", kind: "submit" };
  if (d.phase === "filled") return { label: "Done", kind: "done" };
  if (d.phase === "cancelled") return { label: "Run again", kind: "idle" };
  return { label: "Run overnight cycle", kind: "run" };
}

function ctaHeadline(phase: string, hasBook: boolean): string {
  if (!hasBook) return "Start with your book";
  if (phase === "loaded") return "Ready to run";
  if (phase === "watching") return "Running tonight";
  if (phase === "proposed") return "Ready to submit";
  if (phase === "arming") return "Order in flight";
  if (phase === "filled") return "Night complete";
  if (phase === "cancelled") return "Stopped";
  return "Tonight";
}

function ctaBody(phase: string, hasBook: boolean, hasLegs: boolean): string {
  if (!hasBook) return "Enter with a handle so your book loads, or import a CSV.";
  if (phase === "loaded") return "Press once. We size the overnight moves for you.";
  if (phase === "watching") return "Checking each name and sizing the actions.";
  if (phase === "proposed") {
    return hasLegs
      ? "Read the moves on the left, then submit one rebalance."
      : "Nothing to trade. You can leave the book as is, or run again later.";
  }
  if (phase === "arming") return "A short preview window is open. Wrong market prints cancel the order.";
  if (phase === "filled") return "Fills are logged. You can run another cycle if you want.";
  if (phase === "cancelled") return "No fill. Run again when you are ready.";
  return "Follow the steps above.";
}

function plainPhase(phase: string): string {
  switch (phase) {
    case "empty":
      return "no book";
    case "loaded":
      return "ready";
    case "watching":
      return "running";
    case "proposed":
      return "review";
    case "arming":
      return "submitting";
    case "filled":
      return "done";
    case "cancelled":
      return "cancelled";
    default:
      return phase;
  }
}

function phaseTone(phase: string): "gain" | "loss" | "accent" | "mute" | "warn" | "blue" {
  if (phase === "filled") return "gain";
  if (phase === "cancelled") return "loss";
  if (phase === "arming" || phase === "watching") return "accent";
  if (phase === "proposed") return "blue";
  return "mute";
}
