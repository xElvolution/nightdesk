"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  HeroItem,
  HeroStagger,
  LiftCard,
  PulseDot,
  Reveal,
  Stagger,
  StaggerItem,
} from "./motion";
import { Pill } from "./panel";

const ease = [0.22, 1, 0.36, 1] as const;

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
      {/* ── Hero ─────────────────────────────────────────────── */}
      <section className="relative border-b border-line">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="grid-fade absolute inset-0 opacity-60" />
          <motion.div
            className="absolute left-1/2 top-0 h-[520px] w-[720px] -translate-x-1/2 rounded-full bg-accent/[0.07] blur-[120px]"
            animate={{ opacity: [0.45, 0.7, 0.45] }}
            transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
          />
        </div>

        <div className="relative mx-auto max-w-6xl px-5 pb-20 pt-16 md:px-6 md:pb-28 md:pt-24">
          <HeroStagger>
            <HeroItem>
              <div className="inline-flex items-center gap-2.5 rounded-full border border-line bg-surface/70 px-3.5 py-1.5 backdrop-blur">
                <PulseDot />
                <span className="text-[11px] font-medium tracking-[0.14em] text-mute uppercase">
                  Overnight desk for Bitget rTokens
                </span>
              </div>
            </HeroItem>

            <HeroItem className="mt-10 max-w-4xl">
              <h1 className="text-[42px] font-semibold leading-[1.05] tracking-[-0.035em] text-ink sm:text-5xl md:text-[64px] md:leading-[1.02]">
                US cash closes at 21:00 in Lagos.
                <span className="mt-2 block text-mute md:mt-3">
                  Your rTokens do not.
                </span>
              </h1>
            </HeroItem>

            <HeroItem className="mt-7 max-w-xl">
              <p className="text-[16px] leading-7 text-mute md:text-[17px] md:leading-8">
                Import the Bitget book. Run research, sentiment, risk, and
                execution. Submit one risk-gated rebalance. Every signal closes
                as a sized action with a receipt.
              </p>
            </HeroItem>

            <HeroItem className="mt-10">
              <div className="flex flex-wrap items-center gap-3">
                <motion.div whileHover={{ y: -2 }} whileTap={{ scale: 0.98 }}>
                  <Link
                    href="/desk"
                    className="btn-primary inline-flex px-6 py-3 text-[14px]"
                  >
                    Open desk
                  </Link>
                </motion.div>
                <motion.div whileHover={{ y: -2 }} whileTap={{ scale: 0.98 }}>
                  <a
                    href="#features"
                    className="btn-ghost inline-flex px-6 py-3 text-[14px]"
                  >
                    See product
                  </a>
                </motion.div>
              </div>
            </HeroItem>

            <HeroItem className="mt-16 md:mt-20" scale>
              <ProductMock />
            </HeroItem>
          </HeroStagger>
        </div>
      </section>

      {/* ── Trust strip ──────────────────────────────────────── */}
      <section className="border-b border-line">
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
                <span className="text-[13px] font-medium tracking-[0.08em] text-mute/80 transition-colors hover:text-ink md:text-[14px]">
                  {name}
                </span>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>

      {/* ── Feature blocks (3 with visuals) ──────────────────── */}
      <section
        id="features"
        className="scroll-mt-24 border-b border-line"
      >
        <div className="mx-auto max-w-6xl space-y-24 px-5 py-20 md:space-y-32 md:px-6 md:py-28">
          <Reveal>
            <div className="mx-auto max-w-2xl text-center">
              <div className="label text-accent">Product</div>
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
            reverse={false}
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
            reverse={false}
            visual={<OrderVisual />}
          />
        </div>
      </section>

      {/* ── How it works ─────────────────────────────────────── */}
      <section id="how" className="scroll-mt-24 border-b border-line">
        <div className="mx-auto max-w-6xl px-5 py-20 md:px-6 md:py-28">
          <Reveal>
            <div className="label text-accent">How it works</div>
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
                <LiftCard className="h-full rounded-2xl border border-line bg-surface p-6 md:p-7">
                  <div className="text-[12px] font-medium tabular text-accent">
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

      {/* ── Metrics band ─────────────────────────────────────── */}
      <section
        id="metrics"
        className="scroll-mt-24 border-b border-line bg-bge"
      >
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

      {/* ── Risk callout ─────────────────────────────────────── */}
      <section className="border-b border-line">
        <div className="mx-auto grid max-w-6xl gap-12 px-5 py-20 md:grid-cols-2 md:px-6 md:py-28">
          <Reveal>
            <div className="label text-accent">Risk</div>
            <h2 className="mt-3 text-3xl font-semibold tracking-[-0.03em] text-ink md:text-[36px] md:leading-[1.1]">
              The desk does not debate risk.
            </h2>
            <p className="mt-5 text-[15px] leading-7 text-mute">
              A rule either passes, warns and cuts size, or blocks the ticket.
              Reducing into an earnings window is allowed. Adding is not.
              Cancel-on-anomaly stays live until fill.
            </p>
            <div className="mt-7 flex flex-wrap gap-2">
              <Pill tone="accent">12 hard rules</Pill>
              <Pill tone="loss">Earnings blackout</Pill>
              <Pill tone="gain">Cancel on anomaly</Pill>
            </div>
          </Reveal>
          <Reveal delay={0.1}>
            <RiskMock />
          </Reveal>
        </div>
      </section>

      {/* ── Final CTA ────────────────────────────────────────── */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-1/2 top-1/2 h-64 w-[480px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent/[0.08] blur-[100px]" />
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
                  className="btn-primary inline-flex px-7 py-3.5 text-[14px]"
                >
                  Open desk
                </Link>
              </motion.div>
              <motion.div whileHover={{ y: -2 }} whileTap={{ scale: 0.98 }}>
                <a
                  href="/books/holdings.template.csv"
                  className="btn-ghost inline-flex px-7 py-3.5 text-[14px]"
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
        <div className="label text-accent">{kicker}</div>
        <h3 className="mt-3 text-2xl font-semibold tracking-[-0.025em] text-ink md:text-[32px] md:leading-[1.15]">
          {title}
        </h3>
        <p className="mt-4 max-w-md text-[15px] leading-7 text-mute">{copy}</p>
      </Reveal>
      <Reveal delay={0.08}>{visual}</Reveal>
    </div>
  );
}

/** Product visual mock (not live desk chrome) */
function ProductMock() {
  return (
    <div className="card-glow overflow-hidden rounded-2xl border border-line bg-surface">
      <div className="flex items-center gap-2 border-b border-line bg-surface2/90 px-4 py-3">
        <span className="h-2.5 w-2.5 rounded-full bg-loss/70" />
        <span className="h-2.5 w-2.5 rounded-full bg-warn/70" />
        <span className="h-2.5 w-2.5 rounded-full bg-gain/70" />
        <span className="ml-3 text-[11px] tracking-wide text-faint">
          nightdesk · overnight
        </span>
        <span className="ml-auto inline-flex items-center gap-1.5 text-[10px] text-mute">
          <PulseDot className="bg-gain" />
          Bitget connected
        </span>
      </div>
      <div className="grid gap-0 lg:grid-cols-[1fr_260px]">
        <div className="border-b border-line p-5 lg:border-b-0 lg:border-r lg:p-6">
          <div className="mb-4 flex items-end justify-between">
            <div>
              <div className="label">rNVDA · overnight path</div>
              <div className="mt-1.5 text-[28px] font-medium tracking-tight tabular text-ink">
                128.42
              </div>
            </div>
            <div className="text-right">
              <div className="text-[13px] tabular text-gain">+0.84%</div>
              <div className="text-[10px] text-faint">spread 3.2 bps</div>
            </div>
          </div>
          <MiniChart />
          <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-4">
            {[
              ["Research", "BUY 0.72"],
              ["Sentiment", "heat +18"],
              ["Risk", "pass"],
              ["Execution", "armed"],
            ].map(([a, v], i) => (
              <motion.div
                key={a}
                className="rounded-xl border border-line bg-bg/50 px-3 py-2.5"
                animate={{
                  borderColor: [
                    "rgba(255,255,255,0.08)",
                    "rgba(77,232,255,0.28)",
                    "rgba(255,255,255,0.08)",
                  ],
                }}
                transition={{
                  duration: 3.4,
                  delay: i * 0.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-mute">{a}</span>
                  <PulseDot />
                </div>
                <div className="mt-1.5 text-[12px] font-medium text-ink">{v}</div>
              </motion.div>
            ))}
          </div>
        </div>
        <div className="p-5 lg:p-6">
          <div className="label text-accent">Order · risk-gated</div>
          <div className="mt-4 space-y-2">
            {[
              { side: "BUY", qty: "12", sym: "rNVDA", tone: "text-gain" },
              { side: "SELL", qty: "4", sym: "rTSLA", tone: "text-loss" },
              { side: "HOLD", qty: "0", sym: "rAAPL", tone: "text-mute" },
            ].map((l) => (
              <div
                key={l.sym}
                className="flex items-center justify-between rounded-xl border border-line bg-bg/40 px-3 py-2.5 text-[12px]"
              >
                <span className={`font-medium tabular ${l.tone}`}>
                  {l.side} {l.qty}
                </span>
                <span className="text-ink">{l.sym}</span>
              </div>
            ))}
          </div>
          <div className="mt-5 h-1 overflow-hidden rounded-full bg-line">
            <motion.div
              className="h-full rounded-full bg-accent"
              animate={{ width: ["100%", "8%", "100%"] }}
              transition={{ duration: 8, repeat: Infinity, ease }}
            />
          </div>
          <div className="mt-2 text-[10px] text-faint">
            Preview · cancel-on-anomaly
          </div>
        </div>
      </div>
    </div>
  );
}

function MiniChart() {
  const d =
    "M0 52 C24 50, 48 44, 72 46 S120 30, 144 32 S192 42, 216 24 S264 18, 300 26 S348 14, 384 18 S420 30, 460 22";
  return (
    <svg
      viewBox="0 0 460 72"
      className="h-24 w-full"
      preserveAspectRatio="none"
      aria-hidden
    >
      <defs>
        <linearGradient id="ndFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#4DE8FF" stopOpacity="0.2" />
          <stop offset="100%" stopColor="#4DE8FF" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={`${d} L460 72 L0 72 Z`} fill="url(#ndFill)" />
      <motion.path
        d={d}
        fill="none"
        stroke="#4DE8FF"
        strokeWidth="1.8"
        initial={{ pathLength: 0, opacity: 0.35 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ duration: 1.5, ease }}
      />
    </svg>
  );
}

function ImportVisual() {
  return (
    <LiftCard glow className="rounded-2xl border border-line bg-surface p-5 md:p-6">
      <div className="label">holdings.csv</div>
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
            className="flex items-center justify-between rounded-lg border border-line bg-bg/40 px-3 py-2"
            initial={{ opacity: 0, x: -8 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.08 * i, duration: 0.4, ease }}
          >
            <span className="text-accent">{sym}</span>
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
    <LiftCard glow className="rounded-2xl border border-line bg-surface p-5 md:p-6">
      <div className="grid grid-cols-2 gap-3">
        {[
          ["Research", "BUY", "conf 0.72", "gain"],
          ["Sentiment", "confirm", "heat +18", "accent"],
          ["Risk", "pass", "size ok", "gain"],
          ["Execution", "stage", "armed", "accent"],
        ].map(([name, action, meta, tone], i) => (
          <motion.div
            key={name}
            className="rounded-xl border border-line bg-bg/40 p-3.5"
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 * i, duration: 0.45, ease }}
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-mute">{name}</span>
              <PulseDot />
            </div>
            <div
              className={`mt-2 text-[14px] font-medium ${
                tone === "gain" ? "text-gain" : "text-accent"
              }`}
            >
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
    <LiftCard glow className="rounded-2xl border border-line bg-surface p-5 md:p-6">
      <div className="flex items-center justify-between">
        <div className="label text-accent">Preview armed</div>
        <Pill tone="accent">8.0s</Pill>
      </div>
      <div className="mt-4 space-y-2.5">
        {[
          { side: "BUY", qty: "12 rNVDA", status: "ready", tone: "text-gain" },
          { side: "SELL", qty: "4 rTSLA", status: "ready", tone: "text-loss" },
          { side: "HOLD", qty: "rAAPL", status: "receipt", tone: "text-mute" },
        ].map((l, i) => (
          <motion.div
            key={l.qty}
            className="flex items-center justify-between rounded-xl border border-line bg-bg/40 px-3.5 py-3"
            initial={{ opacity: 0, x: 10 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.08 * i, duration: 0.4, ease }}
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
      <div className="mt-5 h-1.5 overflow-hidden rounded-full bg-line">
        <motion.div
          className="h-full rounded-full bg-accent"
          animate={{ width: ["100%", "0%"] }}
          transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
        />
      </div>
    </LiftCard>
  );
}

function RiskMock() {
  return (
    <div className="card-glow rounded-2xl border border-line bg-surface p-5 md:p-6">
      <div className="label">Live gates</div>
      <div className="mt-4 space-y-2.5">
        {[
          ["Position concentration", "pass", "gain"],
          ["Overnight gap limit", "warn", "warn"],
          ["rTSLA earnings window", "block adds", "loss"],
          ["Spread blowout", "clear", "gain"],
          ["Kill switch", "off", "mute"],
        ].map(([name, status, tone], i) => (
          <motion.div
            key={name}
            className="flex items-center justify-between rounded-xl border border-line bg-bg/40 px-3.5 py-3"
            initial={{ opacity: 0, x: 12 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.07 * i, duration: 0.4, ease }}
          >
            <span className="text-[13px] text-ink">{name}</span>
            <Pill tone={tone as "gain" | "warn" | "loss" | "mute"}>
              {status}
            </Pill>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
