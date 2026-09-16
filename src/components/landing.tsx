"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { HeroMoon } from "./hero-moon";
import {
  HeroItem,
  HeroStagger,
  LiftCard,
  PulseDot,
  Reveal,
  Stagger,
  StaggerItem,
} from "./motion";

const TRUST = [
  "Bitget",
  "rAAPL",
  "rNVDA",
  "rTSLA",
  "rMSFT",
  "rAMZN",
  "USDT",
];

export function Landing() {
  return (
    <div className="overflow-x-hidden">
      <section className="relative">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div
            className="absolute inset-0 opacity-80"
            style={{
              background:
                "radial-gradient(ellipse 85% 50% at 50% -8%, rgba(100,140,220,0.16), transparent 55%), radial-gradient(ellipse 40% 35% at 85% 15%, rgba(70,100,180,0.08), transparent 50%)",
            }}
          />
        </div>

        <div className="relative mx-auto max-w-6xl px-5 pb-20 pt-8 md:px-6 md:pb-28 md:pt-12">
          <HeroStagger>
            <HeroItem>
              <div className="inline-flex items-center gap-2.5 rounded-full border border-sky-300/15 bg-sky-400/[0.04] px-3 py-1">
                <PulseDot className="bg-sky-300" />
                <span className="text-[11px] font-medium tracking-[0.16em] text-sky-100/75 uppercase">
                  Overnight desk · Bitget rTokens
                </span>
              </div>
            </HeroItem>

            <HeroItem className="mt-9 max-w-3xl md:mt-12">
              <h1 className="text-[40px] font-semibold leading-[1.04] tracking-[-0.04em] text-ink sm:text-5xl md:text-[64px] md:leading-[1.0]">
                Night falls on Lagos at 21:00.
                <span className="mt-2.5 block bg-gradient-to-r from-sky-100 via-indigo-100 to-sky-200 bg-clip-text text-transparent md:mt-3">
                  The overnight desk stays open.
                </span>
              </h1>
            </HeroItem>

            <HeroItem className="mt-6 max-w-xl md:mt-8">
              <p className="text-[15px] leading-7 text-mute md:text-[17px] md:leading-8">
                When US cash closes, Bitget rTokens keep trading. Import the
                book. Run research, sentiment, risk, and execution. Submit one
                risk-gated rebalance before dawn.
              </p>
            </HeroItem>

            <HeroItem className="mt-10 md:mt-12">
              <div className="flex flex-col items-start gap-5 sm:flex-row sm:items-center sm:gap-8">
                <Link
                  href="/enter"
                  className="inline-flex h-11 items-center rounded-full bg-white px-6 text-[13px] font-semibold tracking-[-0.01em] text-[#0a0612] transition duration-200 hover:bg-white/90 active:translate-y-px"
                >
                  Open desk
                </Link>
                <a
                  href="#how"
                  className="group inline-flex items-center gap-1.5 text-[13px] font-medium tracking-[-0.01em] text-mute transition duration-200 hover:text-ink"
                >
                  How it works
                  <span
                    aria-hidden
                    className="translate-y-px text-[12px] transition-transform duration-200 group-hover:translate-x-0.5"
                  >
                    →
                  </span>
                </a>
              </div>
              <p className="mt-6 text-[12px] tracking-[-0.01em] text-sky-100/50">
                4 operators on desk tonight · books active across WAT
              </p>
            </HeroItem>

            <HeroItem className="mt-16 md:mt-20" scale>
              <HeroMoon />
            </HeroItem>
          </HeroStagger>
        </div>
      </section>

      <section className="border-y border-white/[0.06]">
        <div className="mx-auto max-w-6xl px-5 py-10 md:px-6 md:py-12">
          <Reveal>
            <p className="mb-6 text-center text-[11px] font-medium tracking-[0.16em] text-faint uppercase">
              Built for the Bitget overnight book
            </p>
          </Reveal>
          <Stagger
            className="flex flex-wrap items-center justify-center gap-x-8 gap-y-4 md:gap-x-12"
            stagger={0.05}
          >
            {TRUST.map((name) => (
              <StaggerItem key={name}>
                <span className="text-[13px] font-medium tracking-[0.08em] text-mute/80 transition-colors hover:text-sky-100 md:text-[14px]">
                  {name}
                </span>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>

      <section id="features" className="scroll-mt-28">
        <div className="mx-auto max-w-6xl space-y-24 px-5 py-20 md:space-y-28 md:px-6 md:py-28">
          <Reveal>
            <div className="mx-auto max-w-2xl text-center">
              <div className="text-[11px] font-medium tracking-[0.16em] text-sky-200/80 uppercase">
                Product
              </div>
              <h2 className="mt-3 text-3xl font-semibold tracking-[-0.03em] text-ink md:text-[40px] md:leading-[1.1]">
                Three surfaces. One overnight book.
              </h2>
              <p className="mt-4 text-[15px] leading-7 text-mute">
                Holdings in. Agents size every name. Risk gates the ticket
                before anything reaches the venue.
              </p>
            </div>
          </Reveal>

          <FeatureRow
            kicker="01 · Import"
            title="Load the Bitget book once."
            copy="CSV of rAAPL, rNVDA, rTSLA, rMSFT, rAMZN plus a USDT sleeve. The ledger keeps the book on the server and in the browser so the desk resumes where the operator left it."
            visual={<ImportVisual />}
          />
          <FeatureRow
            kicker="02 · Agents"
            title="Each agent must size the rToken."
            copy="Research, sentiment, risk, and execution each print a sized action. Hold is an action. Flat still gets a receipt. Nothing ends as commentary."
            reverse
            visual={<AgentsVisual />}
          />
          <FeatureRow
            kicker="03 · Execution"
            title="One gated order. Full receipt chain."
            copy="Preview arms for 8 seconds. Spread blowout, stale quote, sentiment flip, or kill switch cancels before fill. The blotter and hash chain keep the night."
            visual={<OrderVisual />}
          />
        </div>
      </section>

      <section
        id="how"
        className="scroll-mt-28 border-t border-white/[0.06] bg-[#070a12]/70"
      >
        <div className="mx-auto max-w-6xl px-5 py-20 md:px-6 md:py-28">
          <Reveal>
            <div className="text-[11px] font-medium tracking-[0.16em] text-sky-200/80 uppercase">
              How it works
            </div>
            <h2 className="mt-3 max-w-2xl text-3xl font-semibold tracking-[-0.03em] text-ink md:text-[40px] md:leading-[1.1]">
              From CSV to receipt in one cycle.
            </h2>
          </Reveal>

          <Stagger className="mt-14 grid gap-4 md:grid-cols-3" stagger={0.1}>
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
              <StaggerItem key={s.step}>
                <LiftCard className="h-full rounded-2xl border border-white/[0.08] bg-gradient-to-b from-sky-500/[0.06] to-transparent p-6 md:p-7">
                  <div className="text-[12px] font-medium tabular text-sky-200">
                    {s.step}
                  </div>
                  <h3 className="mt-4 text-[17px] font-medium tracking-tight text-ink">
                    {s.title}
                  </h3>
                  <p className="mt-3 text-[13px] leading-6 text-mute">{s.body}</p>
                </LiftCard>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>

      <section className="border-t border-white/[0.06]">
        <div className="mx-auto max-w-6xl px-5 py-16 md:px-6 md:py-20">
          <Stagger
            className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4"
            stagger={0.08}
          >
            {[
              {
                value: "15h",
                label: "Uncovered overnight",
                hint: "Lagos close to US open",
              },
              {
                value: "12",
                label: "Hard risk rules",
                hint: "Pass, warn, or block",
              },
              {
                value: "8s",
                label: "Preview window",
                hint: "Cancel on anomaly",
              },
              {
                value: "5",
                label: "Receipts per cycle",
                hint: "One per name, hold included",
              },
            ].map((m) => (
              <StaggerItem key={m.label}>
                <div className="text-center lg:text-left">
                  <div className="text-4xl font-semibold tracking-[-0.04em] text-ink tabular md:text-5xl">
                    {m.value}
                  </div>
                  <div className="mt-3 text-[13px] font-medium text-ink">
                    {m.label}
                  </div>
                  <div className="mt-1 text-[12px] text-faint">{m.hint}</div>
                </div>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>

      <section className="relative overflow-hidden border-t border-white/[0.06]">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-1/2 top-1/2 h-72 w-[520px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-sky-500/[0.1] blur-[110px]" />
        </div>
        <div className="relative mx-auto max-w-3xl px-5 py-24 text-center md:px-6 md:py-32">
          <Reveal>
            <h2 className="text-3xl font-semibold tracking-[-0.03em] text-ink md:text-[44px] md:leading-[1.08]">
              Open the overnight desk.
            </h2>
            <p className="mx-auto mt-5 max-w-lg text-[15px] leading-7 text-mute">
              Import holdings. Run the agent cycle. Submit one risk-gated
              rebalance before the next cash open.
            </p>
            <div className="mt-10 flex flex-col items-center gap-5 sm:flex-row sm:justify-center sm:gap-8">
              <Link
                href="/enter"
                className="inline-flex h-11 items-center rounded-full bg-white px-6 text-[13px] font-semibold tracking-[-0.01em] text-[#0a0612] transition duration-200 hover:bg-white/90 active:translate-y-px"
              >
                Open desk
              </Link>
              <a
                href="/books/holdings.template.csv"
                className="group inline-flex items-center gap-1.5 text-[13px] font-medium tracking-[-0.01em] text-mute transition duration-200 hover:text-ink"
              >
                Holdings CSV template
                <span
                  aria-hidden
                  className="translate-y-px text-[12px] transition-transform duration-200 group-hover:translate-x-0.5"
                >
                  →
                </span>
              </a>
            </div>
          </Reveal>
        </div>
      </section>
    </div>
  );
}

function FeatureRow({
  kicker,
  title,
  copy,
  reverse,
  visual,
}: {
  kicker: string;
  title: string;
  copy: string;
  reverse?: boolean;
  visual: React.ReactNode;
}) {
  return (
    <div
      className={`grid items-center gap-10 lg:grid-cols-2 lg:gap-16 ${
        reverse ? "lg:[&>*:first-child]:order-2" : ""
      }`}
    >
      <Reveal>
        <div className="text-[11px] font-medium tracking-[0.14em] text-sky-200/80 uppercase">
          {kicker}
        </div>
        <h3 className="mt-3 text-2xl font-semibold tracking-[-0.025em] text-ink md:text-[32px] md:leading-[1.15]">
          {title}
        </h3>
        <p className="mt-4 max-w-md text-[15px] leading-7 text-mute">{copy}</p>
      </Reveal>
      <Reveal delay={0.08}>{visual}</Reveal>
    </div>
  );
}

function ImportVisual() {
  return (
    <LiftCard
      glow
      className="rounded-2xl border border-white/[0.08] bg-[#0a0e18] p-5 md:p-6"
    >
      <div className="text-[10px] font-medium tracking-[0.14em] text-faint uppercase">
        holdings.csv
      </div>
      <div className="mt-4 space-y-2 font-mono text-[12px]">
        {[
          ["rAAPL", "48", "214.20"],
          ["rNVDA", "22", "126.80"],
          ["rTSLA", "15", "248.10"],
          ["rMSFT", "30", "418.55"],
          ["USDT", "4200", "1.00"],
        ].map(([sym, qty, px], i) => (
          <motion.div
            key={sym}
            className="flex items-center justify-between rounded-xl border border-white/[0.07] bg-sky-500/[0.04] px-3 py-2"
            initial={{ opacity: 0, x: -8 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.08 * i, duration: 0.4 }}
          >
            <span className="text-sky-200">{sym}</span>
            <span className="text-mute">{qty}</span>
            <span className="tabular text-ink">{px}</span>
          </motion.div>
        ))}
      </div>
    </LiftCard>
  );
}

function AgentsVisual() {
  return (
    <LiftCard
      glow
      className="rounded-2xl border border-white/[0.08] bg-[#0a0e18] p-5 md:p-6"
    >
      <div className="grid grid-cols-2 gap-3">
        {[
          ["Research", "BUY", "conf 0.72"],
          ["Sentiment", "confirm", "heat +18"],
          ["Risk", "pass", "size ok"],
          ["Execution", "stage", "armed"],
        ].map(([name, action, meta], i) => (
          <motion.div
            key={name}
            className="rounded-xl border border-white/[0.07] bg-sky-500/[0.04] p-3.5"
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 * i, duration: 0.45 }}
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-mute">{name}</span>
              <PulseDot className="bg-sky-300" />
            </div>
            <div className="mt-2 text-[14px] font-medium text-sky-100">
              {action}
            </div>
            <div className="mt-1 text-[10px] text-faint">{meta}</div>
          </motion.div>
        ))}
      </div>
    </LiftCard>
  );
}

function OrderVisual() {
  return (
    <LiftCard
      glow
      className="rounded-2xl border border-white/[0.08] bg-[#0a0e18] p-5 md:p-6"
    >
      <div className="flex items-center justify-between">
        <div className="text-[10px] font-medium tracking-[0.14em] text-sky-200/80 uppercase">
          Preview armed
        </div>
        <span className="rounded-full bg-sky-500/15 px-2.5 py-1 text-[10px] font-medium text-sky-100">
          8.0s
        </span>
      </div>
      <div className="mt-4 space-y-2.5">
        {[
          { side: "BUY", qty: "12 rNVDA", status: "ready", tone: "text-gain" },
          { side: "SELL", qty: "4 rTSLA", status: "ready", tone: "text-loss" },
          { side: "HOLD", qty: "rAAPL", status: "receipt", tone: "text-mute" },
        ].map((l, i) => (
          <motion.div
            key={l.qty}
            className="flex items-center justify-between rounded-xl border border-white/[0.07] bg-sky-500/[0.04] px-3.5 py-3"
            initial={{ opacity: 0, x: 10 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.08 * i, duration: 0.4 }}
          >
            <div>
              <span className={`text-[13px] font-medium tabular ${l.tone}`}>
                {l.side}
              </span>
              <span className="ml-2 text-[13px] text-ink">{l.qty}</span>
            </div>
            <span className="text-[10px] tracking-wide text-faint uppercase">
              {l.status}
            </span>
          </motion.div>
        ))}
      </div>
      <div className="mt-5 h-1.5 overflow-hidden rounded-full bg-white/10">
        <motion.div
          className="h-full rounded-full bg-sky-300"
          animate={{ width: ["100%", "0%"] }}
          transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
        />
      </div>
    </LiftCard>
  );
}
