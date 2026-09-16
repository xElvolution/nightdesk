"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { HeroPortal } from "./hero-portal";
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
            className="absolute inset-0 opacity-70"
            style={{
              background:
                "radial-gradient(ellipse 90% 55% at 50% -10%, rgba(124,58,237,0.22), transparent 55%), radial-gradient(ellipse 50% 40% at 80% 20%, rgba(91,33,182,0.12), transparent 50%)",
            }}
          />
        </div>

        <div className="relative mx-auto max-w-6xl px-5 pb-16 pt-14 md:px-6 md:pb-24 md:pt-20">
          <HeroStagger>
            <HeroItem>
              <div className="inline-flex items-center gap-2.5 rounded-full border border-violet-400/20 bg-violet-500/5 px-3.5 py-1.5 backdrop-blur">
                <PulseDot className="bg-violet-400" />
                <span className="text-[11px] font-medium tracking-[0.14em] text-violet-200/80 uppercase">
                  Overnight desk for Bitget rTokens
                </span>
              </div>
            </HeroItem>

            <HeroItem className="mt-8 max-w-3xl md:mt-10">
              <h1 className="text-[40px] font-semibold leading-[1.05] tracking-[-0.035em] text-ink sm:text-5xl md:text-[60px] md:leading-[1.02]">
                US cash closes at 21:00 in Lagos.
                <span className="mt-2 block bg-gradient-to-r from-violet-200 via-fuchsia-200 to-violet-300 bg-clip-text text-transparent md:mt-3">
                  Your rTokens do not.
                </span>
              </h1>
            </HeroItem>

            <HeroItem className="mt-6 max-w-xl md:mt-7">
              <p className="text-[16px] leading-7 text-mute md:text-[17px] md:leading-8">
                Import the Bitget book. Run research, sentiment, risk, and
                execution. Submit one risk-gated rebalance. Every signal closes
                as a sized action with a receipt.
              </p>
            </HeroItem>

            <HeroItem className="mt-9 md:mt-10">
              <div className="flex flex-wrap items-center gap-3">
                <motion.div whileHover={{ y: -2 }} whileTap={{ scale: 0.98 }}>
                  <Link
                    href="/desk"
                    className="inline-flex items-center rounded-full bg-white px-7 py-3 text-[14px] font-semibold text-[#0a0612] shadow-[0_0_32px_rgba(167,139,250,0.25)] transition hover:shadow-[0_0_40px_rgba(167,139,250,0.4)]"
                  >
                    Get started
                  </Link>
                </motion.div>
                <motion.div whileHover={{ y: -2 }} whileTap={{ scale: 0.98 }}>
                  <a
                    href="#how"
                    className="inline-flex items-center rounded-full border border-white/15 bg-white/[0.03] px-6 py-3 text-[14px] font-medium text-ink transition hover:border-violet-400/35 hover:bg-violet-500/10"
                  >
                    How it works
                  </a>
                </motion.div>
              </div>
            </HeroItem>

            <HeroItem className="mt-14 md:mt-16" scale>
              <HeroPortal />
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
                <span className="text-[13px] font-medium tracking-[0.08em] text-mute/80 transition-colors hover:text-violet-200 md:text-[14px]">
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
              <div className="text-[11px] font-medium tracking-[0.16em] text-violet-300/80 uppercase">
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
        className="scroll-mt-28 border-t border-white/[0.06] bg-[#08060e]/60"
      >
        <div className="mx-auto max-w-6xl px-5 py-20 md:px-6 md:py-28">
          <Reveal>
            <div className="text-[11px] font-medium tracking-[0.16em] text-violet-300/80 uppercase">
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
                <LiftCard className="h-full rounded-2xl border border-white/[0.08] bg-gradient-to-b from-violet-500/[0.07] to-transparent p-6 md:p-7">
                  <div className="text-[12px] font-medium tabular text-violet-300">
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
          <div className="absolute left-1/2 top-1/2 h-72 w-[520px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-violet-600/[0.14] blur-[110px]" />
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
            <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
              <motion.div whileHover={{ y: -2 }} whileTap={{ scale: 0.98 }}>
                <Link
                  href="/desk"
                  className="inline-flex items-center rounded-full bg-white px-8 py-3.5 text-[14px] font-semibold text-[#0a0612] shadow-[0_0_36px_rgba(167,139,250,0.28)]"
                >
                  Get started
                </Link>
              </motion.div>
              <motion.div whileHover={{ y: -2 }} whileTap={{ scale: 0.98 }}>
                <a
                  href="/books/holdings.template.csv"
                  className="inline-flex items-center rounded-full border border-white/15 bg-white/[0.03] px-7 py-3.5 text-[14px] font-medium text-ink transition hover:border-violet-400/35"
                >
                  Holdings CSV template
                </a>
              </motion.div>
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
        <div className="text-[11px] font-medium tracking-[0.14em] text-violet-300/80 uppercase">
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
      className="rounded-2xl border border-white/[0.08] bg-[#0c0a14] p-5 md:p-6"
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
            className="flex items-center justify-between rounded-xl border border-white/[0.07] bg-violet-500/[0.04] px-3 py-2"
            initial={{ opacity: 0, x: -8 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.08 * i, duration: 0.4 }}
          >
            <span className="text-violet-300">{sym}</span>
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
      className="rounded-2xl border border-white/[0.08] bg-[#0c0a14] p-5 md:p-6"
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
            className="rounded-xl border border-white/[0.07] bg-violet-500/[0.04] p-3.5"
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 * i, duration: 0.45 }}
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-mute">{name}</span>
              <PulseDot className="bg-violet-400" />
            </div>
            <div className="mt-2 text-[14px] font-medium text-violet-200">
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
      className="rounded-2xl border border-white/[0.08] bg-[#0c0a14] p-5 md:p-6"
    >
      <div className="flex items-center justify-between">
        <div className="text-[10px] font-medium tracking-[0.14em] text-violet-300/80 uppercase">
          Preview armed
        </div>
        <span className="rounded-full bg-violet-500/15 px-2.5 py-1 text-[10px] font-medium text-violet-200">
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
            className="flex items-center justify-between rounded-xl border border-white/[0.07] bg-violet-500/[0.04] px-3.5 py-3"
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
          className="h-full rounded-full bg-violet-400"
          animate={{ width: ["100%", "0%"] }}
          transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
        />
      </div>
    </LiftCard>
  );
}
