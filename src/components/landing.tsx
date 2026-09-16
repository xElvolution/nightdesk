"use client";

import Link from "next/link";
import { NotchFrame } from "./notch-frame";

const TRUST = ["Bitget", "rAAPL", "rNVDA", "rTSLA", "rMSFT", "rAMZN", "USDT"];

export function Landing() {
  return (
    <div className="overflow-x-hidden">
      {/* Magenta poster hero */}
      <section className="mkt-hero relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden">
          <span className="mkt-hero-wordmark select-none" aria-hidden>
            NIGHTDESK
          </span>
        </div>

        <div className="relative mx-auto flex max-w-6xl flex-col items-center px-5 pb-16 pt-10 md:px-8 md:pb-24 md:pt-14">
          <p className="mkt-kicker text-[var(--mkt-cream)]/80">
            Overnight desk · Bitget rTokens
          </p>

          <div className="relative mt-8 w-full max-w-md md:mt-10 md:max-w-lg">
            <NotchFrame pad={false} className="mkt-hero-frame">
              <HeroMark />
            </NotchFrame>
          </div>

          <h1 className="mkt-display mt-10 text-center text-[var(--mkt-cream)] md:mt-12">
            Lagos 21:00
            <span className="mt-1 block text-[var(--mkt-cream)]/90">
              rTokens stay open
            </span>
          </h1>

          <p className="mx-auto mt-5 max-w-md text-center text-[14px] leading-6 text-[var(--mkt-cream)]/75 md:text-[15px] md:leading-7">
            Import the Bitget book. Run research, sentiment, risk, and
            execution. Submit one risk-gated rebalance. Every signal closes as a
            sized action with a receipt.
          </p>

          <div className="mt-9 flex flex-col items-center gap-4 sm:flex-row sm:gap-5">
            <Link href="/enter" className="mkt-btn-solid">
              Open desk
            </Link>
            <a href="#how" className="mkt-btn-ghost-light">
              How it works
            </a>
          </div>

          <p className="mt-6 text-[11px] tracking-[0.12em] text-[var(--mkt-cream)]/55 uppercase">
            4 operators on desk tonight · books active across WAT
          </p>
        </div>
      </section>

      {/* Trust strip */}
      <section className="border-b border-[var(--mkt-red)]/20 bg-[var(--mkt-cream)]">
        <div className="mx-auto max-w-6xl px-5 py-10 md:px-8 md:py-12">
          <p className="mb-6 text-center text-[11px] font-semibold tracking-[0.2em] text-[var(--mkt-red)] uppercase">
            Built for the Bitget overnight book
          </p>
          <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3 md:gap-x-12">
            {TRUST.map((name) => (
              <span
                key={name}
                className="font-[family-name:var(--font-display)] text-[13px] font-semibold tracking-[0.12em] text-[var(--mkt-ink)]/70 uppercase md:text-[14px]"
              >
                {name}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Product */}
      <section
        id="product"
        className="scroll-mt-8 bg-[var(--mkt-cream)]"
      >
        <div className="mx-auto max-w-6xl space-y-16 px-5 py-16 md:space-y-20 md:px-8 md:py-24">
          <div className="text-center">
            <h2 className="mkt-section-title">PRODUCT</h2>
            <p className="mx-auto mt-4 max-w-xl text-[15px] leading-7 text-[var(--mkt-ink)]/70">
              Three surfaces. One overnight book. Holdings in. Agents size every
              name. Risk gates the ticket before anything reaches the venue.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3 md:gap-6">
            {[
              {
                n: "01",
                title: "Import",
                body: "CSV of rAAPL, rNVDA, rTSLA, rMSFT, rAMZN plus a USDT sleeve. The ledger keeps the book so the desk resumes where the operator left it.",
              },
              {
                n: "02",
                title: "Agents",
                body: "Research, sentiment, risk, and execution each print a sized action. Hold is an action. Flat still gets a receipt.",
              },
              {
                n: "03",
                title: "Execution",
                body: "Preview arms for 8 seconds. Spread blowout, stale quote, sentiment flip, or kill switch cancels before fill.",
              },
            ].map((card) => (
              <NotchFrame key={card.n}>
                <div className="font-[family-name:var(--font-display)] text-[12px] font-semibold tracking-[0.18em] text-[var(--mkt-red)]">
                  {card.n}
                </div>
                <h3 className="mt-4 font-[family-name:var(--font-display)] text-[28px] font-bold leading-none tracking-[-0.02em] text-[var(--mkt-red)] uppercase md:text-[32px]">
                  {card.title}
                </h3>
                <p className="mt-4 text-[13px] leading-6 text-[var(--mkt-ink)]/70">
                  {card.body}
                </p>
              </NotchFrame>
            ))}
          </div>

          <div className="grid items-stretch gap-8 lg:grid-cols-2 lg:gap-10">
            <NotchFrame>
              <div className="text-[10px] font-semibold tracking-[0.16em] text-[var(--mkt-red)] uppercase">
                holdings.csv
              </div>
              <div className="mt-4 space-y-2 font-mono text-[12px]">
                {[
                  ["rAAPL", "48", "214.20"],
                  ["rNVDA", "22", "126.80"],
                  ["rTSLA", "15", "248.10"],
                  ["rMSFT", "30", "418.55"],
                  ["USDT", "4200", "1.00"],
                ].map(([sym, qty, px]) => (
                  <div
                    key={sym}
                    className="flex items-center justify-between border border-[var(--mkt-red)]/25 bg-[var(--mkt-cream)] px-3 py-2"
                  >
                    <span className="font-semibold text-[var(--mkt-red)]">
                      {sym}
                    </span>
                    <span className="text-[var(--mkt-ink)]/55">{qty}</span>
                    <span className="tabular text-[var(--mkt-ink)]">{px}</span>
                  </div>
                ))}
              </div>
            </NotchFrame>

            <NotchFrame>
              <div className="text-[10px] font-semibold tracking-[0.16em] text-[var(--mkt-red)] uppercase">
                Agent cycle
              </div>
              <div className="mt-4 grid grid-cols-2 gap-3">
                {[
                  ["Research", "BUY", "conf 0.72"],
                  ["Sentiment", "confirm", "heat +18"],
                  ["Risk", "pass", "size ok"],
                  ["Execution", "stage", "armed"],
                ].map(([name, action, meta]) => (
                  <div
                    key={name}
                    className="border border-[var(--mkt-red)]/25 bg-[var(--mkt-cream)] p-3.5"
                  >
                    <div className="text-[11px] text-[var(--mkt-ink)]/55">
                      {name}
                    </div>
                    <div className="mt-2 font-[family-name:var(--font-display)] text-[16px] font-bold tracking-wide text-[var(--mkt-red)] uppercase">
                      {action}
                    </div>
                    <div className="mt-1 text-[10px] text-[var(--mkt-ink)]/45">
                      {meta}
                    </div>
                  </div>
                ))}
              </div>
            </NotchFrame>
          </div>
        </div>
      </section>

      {/* How */}
      <section
        id="how"
        className="scroll-mt-8 border-t border-[var(--mkt-red)]/20 bg-[var(--mkt-cream)]"
      >
        <div className="mx-auto max-w-6xl px-5 py-16 md:px-8 md:py-24">
          <h2 className="mkt-section-title">HOW</h2>
          <p className="mt-4 max-w-xl text-[15px] leading-7 text-[var(--mkt-ink)]/70">
            From CSV to receipt in one cycle.
          </p>

          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {[
              {
                step: "01",
                title: "Import holdings",
                body: "Drop the Bitget CSV. Symbols map to the five rTokens plus cash. The desk loads quotes and opens the overnight watch.",
              },
              {
                step: "02",
                title: "Run the cycle",
                body: "Research sets bias. Sentiment confirms or cuts. Risk applies twelve hard rules. Execution stages the ticket.",
              },
              {
                step: "03",
                title: "Submit once",
                body: "Arm the preview. Cancel-on-anomaly stays live until fill. Every leg writes a receipt into the hash chain.",
              },
            ].map((s) => (
              <NotchFrame key={s.step}>
                <div className="font-[family-name:var(--font-display)] text-[40px] font-bold leading-none tracking-[-0.04em] text-[var(--mkt-red)]">
                  {s.step}
                </div>
                <h3 className="mt-5 font-[family-name:var(--font-display)] text-[20px] font-bold tracking-wide text-[var(--mkt-ink)] uppercase">
                  {s.title}
                </h3>
                <p className="mt-3 text-[13px] leading-6 text-[var(--mkt-ink)]/65">
                  {s.body}
                </p>
              </NotchFrame>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-t border-[var(--mkt-red)]/20 bg-[var(--mkt-cream)]">
        <div className="mx-auto max-w-6xl px-5 py-14 md:px-8 md:py-16">
          <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                value: "15H",
                label: "Uncovered overnight",
                hint: "Lagos close to US open",
              },
              {
                value: "12",
                label: "Hard risk rules",
                hint: "Pass, warn, or block",
              },
              {
                value: "8S",
                label: "Preview window",
                hint: "Cancel on anomaly",
              },
              {
                value: "5",
                label: "Receipts per cycle",
                hint: "One per name, hold included",
              },
            ].map((m) => (
              <div key={m.label} className="text-center lg:text-left">
                <div className="font-[family-name:var(--font-display)] text-5xl font-bold tracking-[-0.04em] text-[var(--mkt-red)] md:text-6xl">
                  {m.value}
                </div>
                <div className="mt-3 text-[13px] font-semibold tracking-[0.06em] text-[var(--mkt-ink)] uppercase">
                  {m.label}
                </div>
                <div className="mt-1 text-[12px] text-[var(--mkt-ink)]/50">
                  {m.hint}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Open CTA */}
      <section
        id="open"
        className="scroll-mt-8 border-t border-[var(--mkt-red)]/20 bg-[var(--mkt-cream)]"
      >
        <div className="mx-auto max-w-3xl px-5 py-20 text-center md:px-8 md:py-28">
          <h2 className="mkt-section-title">OPEN</h2>
          <p className="mx-auto mt-5 max-w-lg text-[15px] leading-7 text-[var(--mkt-ink)]/70">
            Import holdings. Run the agent cycle. Submit one risk-gated
            rebalance before the next cash open.
          </p>
          <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center sm:gap-5">
            <Link href="/enter" className="mkt-btn-primary">
              Open desk
            </Link>
            <a
              href="/books/holdings.template.csv"
              className="mkt-btn-outline"
            >
              Holdings CSV template
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}

function HeroMark() {
  return (
    <div className="relative flex aspect-[4/5] w-full items-center justify-center bg-[var(--mkt-red)] md:aspect-[5/4]">
      <svg
        viewBox="0 0 320 280"
        className="h-[78%] w-[78%]"
        fill="none"
        aria-hidden
      >
        {/* Flat geometric overnight desk mark */}
        <rect
          x="40"
          y="48"
          width="240"
          height="160"
          stroke="#F1E9E4"
          strokeWidth="3"
        />
        <path
          d="M40 48 L160 20 L280 48"
          stroke="#F1E9E4"
          strokeWidth="3"
          strokeLinejoin="miter"
        />
        <circle cx="160" cy="118" r="42" stroke="#1A1214" strokeWidth="3" />
        <circle cx="160" cy="118" r="28" stroke="#F1E9E4" strokeWidth="2.5" />
        <path
          d="M160 118 L160 88"
          stroke="#1A1214"
          strokeWidth="3"
          strokeLinecap="square"
        />
        <path
          d="M160 118 L182 130"
          stroke="#F1E9E4"
          strokeWidth="2.5"
          strokeLinecap="square"
        />
        <rect x="70" y="175" width="50" height="18" fill="#F1E9E4" />
        <rect x="135" y="175" width="50" height="18" fill="#1A1214" />
        <rect x="200" y="175" width="50" height="18" fill="#F1E9E4" />
        <text
          x="160"
          y="248"
          textAnchor="middle"
          fill="#F1E9E4"
          style={{
            fontFamily: "var(--font-display), sans-serif",
            fontSize: "22px",
            fontWeight: 700,
            letterSpacing: "0.2em",
          }}
        >
          21:00 WAT
        </text>
      </svg>
    </div>
  );
}
