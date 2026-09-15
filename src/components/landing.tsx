"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { FadeIn, LiftCard, PulseDot, Reveal, Stagger, StaggerItem } from "./motion";
import { Pill } from "./panel";
import { ClockPair } from "./clocks";

const ease = [0.22, 1, 0.36, 1] as const;

export function Landing() {
  return (
    <div className="overflow-x-hidden">
      {/* Hero */}
      <section className="relative border-b border-line">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <motion.div
            className="absolute -left-24 top-10 h-72 w-72 rounded-full bg-accent/10 blur-[100px]"
            animate={{ opacity: [0.35, 0.55, 0.35], scale: [1, 1.08, 1] }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="absolute -right-16 bottom-0 h-80 w-80 rounded-full bg-gain/5 blur-[110px]"
            animate={{ opacity: [0.2, 0.4, 0.2] }}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          />
        </div>

        <div className="relative mx-auto max-w-6xl px-5 pb-16 pt-14 md:pb-24 md:pt-20">
          <FadeIn delay={0.05}>
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="inline-flex items-center gap-2 rounded-full border border-line bg-surface/80 px-3 py-1.5 backdrop-blur">
                <PulseDot />
                <span className="text-[11px] font-medium tracking-[0.12em] text-mute uppercase">
                  Bitget rToken overnight desk
                </span>
              </div>
              <ClockPair />
            </div>
          </FadeIn>

          <FadeIn delay={0.18} y={22} className="mt-10 max-w-4xl">
            <h1 className="text-4xl font-semibold leading-[1.08] tracking-tight text-ink md:text-6xl md:leading-[1.05]">
              US cash closes at 21:00 in Lagos.
              <span className="mt-2 block text-mute">Your rTokens do not.</span>
            </h1>
          </FadeIn>

          <FadeIn delay={0.32} y={18} className="mt-6 max-w-2xl">
            <p className="text-[16px] leading-7 text-mute md:text-[17px]">
              Founders and remote teams across Africa hold Apple, NVIDIA, Tesla, Microsoft, and
              Amazon as Bitget rTokens through the night. NightDesk is the overnight book: import
              holdings, run the agent cycle, submit one risk-gated rebalance. Every signal ends as a
              sized action with a receipt.
            </p>
          </FadeIn>

          <FadeIn delay={0.44} y={14} className="mt-9 flex flex-wrap gap-3">
            <motion.div whileHover={{ y: -2 }} whileTap={{ scale: 0.98 }}>
              <Link href="/desk" className="btn-primary inline-flex px-5 py-2.5 text-[13px]">
                Open desk
              </Link>
            </motion.div>
            <motion.div whileHover={{ y: -2 }} whileTap={{ scale: 0.98 }}>
              <a
                href="/books/holdings.template.csv"
                className="btn-ghost inline-flex px-5 py-2.5 text-[13px]"
              >
                Holdings CSV template
              </a>
            </motion.div>
            <motion.div whileHover={{ y: -2 }}>
              <a href="#product" className="inline-flex px-5 py-2.5 text-[13px] text-mute hover:text-ink">
                See product
              </a>
            </motion.div>
          </FadeIn>

          {/* Product shot */}
          <FadeIn delay={0.58} y={36} blur className="mt-14 md:mt-16">
            <DeskPreview />
          </FadeIn>
        </div>
      </section>

      {/* Metrics */}
      <section className="border-b border-line">
        <div className="mx-auto max-w-6xl px-5 py-12 md:py-16">
          <Stagger className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4" stagger={0.1}>
            {[
              { label: "Hours uncovered", value: "15", hint: "Lagos overnight watch", tone: "text-accent" },
              { label: "Fees avoided vs panic", value: "184 USDT", hint: "Round trips vs one gated order", tone: "text-gain" },
              { label: "Overnight gap on book", value: "-1.24%", hint: "Last overnight path", tone: "text-loss" },
              { label: "Receipts required", value: "5", hint: "Buy, sell, or hold. One per name.", tone: "text-ink" },
            ].map((m) => (
              <StaggerItem key={m.label}>
                <LiftCard glow className="rounded-[14px] border border-line bg-surface p-4">
                  <div className="label">{m.label}</div>
                  <div className={`mt-2 text-[22px] font-medium tracking-tight tabular ${m.tone}`}>
                    {m.value}
                  </div>
                  <div className="mt-1 text-[11px] text-mute">{m.hint}</div>
                </LiftCard>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>

      {/* Product story */}
      <section id="product" className="scroll-mt-20 border-b border-line">
        <div className="mx-auto max-w-6xl px-5 py-14 md:py-20">
          <Reveal>
            <div className="label text-accent">Workflow</div>
            <h2 className="mt-2 max-w-2xl text-3xl font-semibold tracking-tight text-ink md:text-4xl">
              Three steps. One gated order. A full receipt chain.
            </h2>
          </Reveal>
          <Stagger className="mt-10 grid gap-4 md:grid-cols-3" stagger={0.12}>
            {[
              {
                k: "01",
                t: "Import the Bitget book",
                c: "CSV of rAAPL, rNVDA, rTSLA, rMSFT, rAMZN plus a USDT sleeve. The ledger stores the book on the server and in the browser so the desk resumes where the operator left it.",
              },
              {
                k: "02",
                t: "Agents size every name",
                c: "Research, sentiment, risk, and execution each print a sized action. Hold is an action. Flat still gets a receipt. Nothing ends as commentary.",
              },
              {
                k: "03",
                t: "Submit once",
                c: "Preview arms for 8 seconds. Spread blowout, stale quote, sentiment flip, or kill switch cancels before fill. The blotter and hash chain keep the night.",
              },
            ].map((s) => (
              <StaggerItem key={s.k}>
                <LiftCard className="h-full rounded-[14px] border border-line bg-surface p-5">
                  <div className="text-[11px] font-medium tabular text-accent">{s.k}</div>
                  <h3 className="mt-2 text-[15px] font-medium tracking-tight text-ink">{s.t}</h3>
                  <p className="mt-2 text-[13px] leading-6 text-mute">{s.c}</p>
                </LiftCard>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>

      {/* Agents */}
      <section id="agents" className="scroll-mt-20 border-b border-line">
        <div className="mx-auto max-w-6xl px-5 py-14 md:py-20">
          <Reveal>
            <div className="label text-accent">Agents</div>
            <h2 className="mt-2 text-3xl font-semibold tracking-tight text-ink md:text-4xl">
              Each one must size the rToken.
            </h2>
          </Reveal>
          <Stagger className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4" stagger={0.08}>
            {[
              ["Research", "Bias, confidence, catalysts. Output is buy, sell, or hold with a horizon."],
              ["Sentiment", "Overnight heat versus the prior print. Confirms size or cuts it."],
              ["Risk", "Twelve hard rules. Earnings blackout lets you reduce and forbids adds."],
              ["Execution", "Stages the ticket, watches the venue, fills or cancels, stamps the receipt."],
            ].map(([name, copy]) => (
              <StaggerItem key={name}>
                <LiftCard glow className="h-full rounded-[14px] border border-line bg-surface p-4">
                  <div className="flex items-center justify-between">
                    <div className="text-[13px] font-medium text-ink">{name}</div>
                    <PulseDot className="bg-accent" />
                  </div>
                  <p className="mt-3 text-[12px] leading-5 text-mute">{copy}</p>
                </LiftCard>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>

      {/* Risk + CTA */}
      <section id="risk" className="scroll-mt-20">
        <div className="mx-auto grid max-w-6xl gap-10 px-5 py-14 md:grid-cols-2 md:py-20">
          <Reveal>
            <div className="label text-accent">Risk</div>
            <h2 className="mt-2 text-3xl font-semibold tracking-tight text-ink">
              The desk does not debate risk.
            </h2>
            <p className="mt-4 text-[14px] leading-7 text-mute">
              A rule either passes, warns and cuts size, or blocks the ticket. Reducing into an
              earnings window is allowed. Adding is not. Cancel-on-anomaly stays live until fill.
            </p>
            <div className="mt-6 flex flex-wrap gap-2">
              <Pill tone="accent">12 hard rules</Pill>
              <Pill tone="loss">Earnings blackout</Pill>
              <Pill tone="gain">Cancel on anomaly</Pill>
            </div>
            <div className="mt-8">
              <Link href="/desk" className="btn-primary inline-flex px-5 py-2.5 text-[13px]">
                Open the overnight desk
              </Link>
            </div>
          </Reveal>
          <Reveal delay={0.12}>
            <RiskPreview />
          </Reveal>
        </div>
      </section>
    </div>
  );
}

function DeskPreview() {
  return (
    <div className="card-glow overflow-hidden rounded-[16px] border border-line bg-surface">
      <div className="flex items-center gap-2 border-b border-line bg-surface2/80 px-4 py-2.5">
        <span className="h-2 w-2 rounded-full bg-loss/80" />
        <span className="h-2 w-2 rounded-full bg-warn/80" />
        <span className="h-2 w-2 rounded-full bg-gain/80" />
        <span className="ml-3 text-[11px] tracking-wide text-faint">nightdesk · desk</span>
        <span className="ml-auto inline-flex items-center gap-1.5 text-[10px] text-mute">
          <PulseDot className="bg-gain" />
          Bitget live
        </span>
      </div>
      <div className="grid gap-0 lg:grid-cols-[1fr_280px]">
        <div className="border-b border-line p-4 lg:border-b-0 lg:border-r">
          <div className="mb-3 flex items-center justify-between">
            <div>
              <div className="label">rNVDA · overnight</div>
              <div className="mt-1 text-[22px] font-medium tabular text-ink">128.42</div>
            </div>
            <div className="text-right">
              <div className="text-[12px] tabular text-gain">+0.84%</div>
              <div className="text-[10px] text-faint">spread 3.2 bps</div>
            </div>
          </div>
          <MiniChart />
          <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
            {["Research", "Sentiment", "Risk", "Execution"].map((a, i) => (
              <motion.div
                key={a}
                className="rounded-xl border border-line bg-bg/60 px-3 py-2"
                animate={{ borderColor: ["rgba(255,255,255,0.08)", "rgba(77,232,255,0.22)", "rgba(255,255,255,0.08)"] }}
                transition={{ duration: 3.2, delay: i * 0.45, repeat: Infinity }}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-mute">{a}</span>
                  <PulseDot />
                </div>
                <div className="mt-1 text-[12px] text-ink">
                  {i === 0 && "BUY 0.72"}
                  {i === 1 && "heat +18"}
                  {i === 2 && "pass"}
                  {i === 3 && "armed"}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
        <div className="p-4">
          <div className="label text-accent">Order · risk-gated</div>
          <div className="mt-3 space-y-2">
            {[
              { side: "BUY", qty: "12", sym: "rNVDA", tone: "text-gain" },
              { side: "SELL", qty: "4", sym: "rTSLA", tone: "text-loss" },
              { side: "HOLD", qty: "0", sym: "rAAPL", tone: "text-mute" },
            ].map((l) => (
              <div
                key={l.sym}
                className="flex items-center justify-between rounded-xl border border-line bg-bg/50 px-3 py-2 text-[12px]"
              >
                <span className={`font-medium tabular ${l.tone}`}>
                  {l.side} {l.qty}
                </span>
                <span className="text-ink">{l.sym}</span>
              </div>
            ))}
          </div>
          <div className="mt-4 h-1 overflow-hidden rounded-full bg-line">
            <motion.div
              className="h-full rounded-full bg-accent"
              animate={{ width: ["100%", "12%", "100%"] }}
              transition={{ duration: 8, repeat: Infinity, ease }}
            />
          </div>
          <div className="mt-2 text-[10px] text-faint">Preview · cancel-on-anomaly</div>
        </div>
      </div>
    </div>
  );
}

function MiniChart() {
  const d =
    "M0 48 C20 46, 40 40, 60 42 S100 28, 120 30 S160 38, 180 22 S220 18, 260 24 S300 12, 340 16 S380 28, 420 20";
  return (
    <svg viewBox="0 0 420 64" className="h-20 w-full" preserveAspectRatio="none" aria-hidden>
      <defs>
        <linearGradient id="ndFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#4DE8FF" stopOpacity="0.22" />
          <stop offset="100%" stopColor="#4DE8FF" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={`${d} L420 64 L0 64 Z`} fill="url(#ndFill)" />
      <motion.path
        d={d}
        fill="none"
        stroke="#4DE8FF"
        strokeWidth="1.8"
        initial={{ pathLength: 0, opacity: 0.4 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ duration: 1.4, ease }}
      />
    </svg>
  );
}

function RiskPreview() {
  return (
    <div className="rounded-[16px] border border-line bg-surface p-5 card-glow">
      <div className="label">Live gates</div>
      <div className="mt-4 space-y-3">
        {[
          ["Position concentration", "pass", "gain"],
          ["Overnight gap limit", "warn", "warn"],
          ["rTSLA earnings window", "block adds", "loss"],
          ["Spread blowout", "clear", "gain"],
          ["Kill switch", "off", "mute"],
        ].map(([name, status, tone], i) => (
          <motion.div
            key={name}
            className="flex items-center justify-between rounded-xl border border-line bg-bg/40 px-3 py-2.5"
            initial={{ opacity: 0, x: 12 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.08 * i, duration: 0.4, ease }}
          >
            <span className="text-[13px] text-ink">{name}</span>
            <Pill tone={tone as "gain" | "warn" | "loss" | "mute"}>{status}</Pill>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
