"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { OperatorGate } from "@/components/operator-gate";
import { useOperator } from "@/components/operator-context";
import { LogoMark } from "@/components/logo";
import { markOnboardingComplete } from "@/lib/onboarding";

const STEPS = [
  {
    id: 1,
    label: "NightDesk",
    title: "One overnight job.",
    body: "NightDesk helps you rebalance Bitget rToken holdings while US markets are closed. You do not need a wall of charts. You need a clear path for tonight.",
  },
  {
    id: 2,
    label: "Your book",
    title: "You land on your book.",
    body: "After you enter, your overnight book is already there (seeded or imported). Names, sizes, and cash sit in plain view so you know what you hold before anything runs.",
  },
  {
    id: 3,
    label: "Run night",
    title: "Press one button.",
    body: "Run overnight cycle. NightDesk sizes the moves across your names. You wait a moment, then you get a short list of suggested actions in plain language.",
  },
  {
    id: 4,
    label: "Submit",
    title: "Submit one rebalance.",
    body: "Read the moves. If they look right, press Submit rebalance once. A short preview window stays open so a bad print can cancel before fill.",
  },
  {
    id: 5,
    label: "Receipts",
    title: "Keep the receipts.",
    body: "Filled tickets show as bought or sold with size and price. That is the close of the night. Secondary tools like risk and blotter stay available, but the desk is the product home.",
  },
] as const;

export default function OnboardingPage() {
  return (
    <OperatorGate mode="onboarding">
      <OnboardingInner />
    </OperatorGate>
  );
}

function OnboardingInner() {
  const router = useRouter();
  const { operator } = useOperator();
  const [step, setStep] = useState(0);

  const finish = useCallback(() => {
    if (operator?.id) markOnboardingComplete(operator.id);
    router.push("/desk");
  }, [operator?.id, router]);

  const next = useCallback(() => {
    if (step >= STEPS.length - 1) {
      finish();
      return;
    }
    setStep((s) => s + 1);
  }, [step, finish]);

  const current = STEPS[step];

  return (
    <main className="relative mx-auto flex min-h-[80vh] max-w-lg flex-col px-5 pb-16 pt-10 sm:px-8 sm:pt-14">
      <div className="mb-10 flex items-center gap-2.5">
        <LogoMark size={26} />
        <span className="text-[12px] font-semibold tracking-[0.16em] text-ink">
          NIGHTDESK
        </span>
      </div>

      <div className="mb-6 flex items-center justify-between">
        <p className="text-[10px] font-medium tracking-[0.22em] text-accent/80 uppercase">
          Onboarding
        </p>
        <p className="tabular text-[10px] font-medium tracking-[0.22em] text-faint uppercase">
          {step + 1} / {STEPS.length}
        </p>
      </div>

      <div className="mb-8 flex gap-2">
        {STEPS.map((s, i) => (
          <div
            key={s.id}
            className={`h-1 flex-1 rounded-full transition-colors ${
              i <= step ? "bg-accent" : "bg-white/10"
            }`}
          />
        ))}
      </div>

      <div className="relative flex flex-1 flex-col justify-center overflow-hidden rounded-2xl border border-line bg-surface p-8 card-glow sm:p-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={current.id}
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -24 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          >
            <p className="text-[10px] font-medium tracking-[0.28em] text-accent/70 uppercase">
              {current.label}
            </p>
            <h1 className="mt-3 text-3xl font-semibold leading-tight tracking-tight text-ink sm:text-4xl">
              {current.title}
            </h1>
            <p className="mt-5 text-[14px] leading-relaxed text-mute sm:text-[15px]">
              {current.body}
            </p>
          </motion.div>
        </AnimatePresence>

        <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:items-center">
          <button
            type="button"
            onClick={next}
            className="inline-flex items-center justify-center rounded-full bg-white px-7 py-3.5 text-[13px] font-semibold text-[#0a0612] transition hover:bg-white/90"
          >
            {step >= STEPS.length - 1 ? "Open desk" : "Continue"}
          </button>
          {step < STEPS.length - 1 && (
            <button
              type="button"
              onClick={finish}
              className="inline-flex items-center justify-center rounded-full border border-line px-5 py-3.5 text-[11px] font-medium tracking-[0.14em] text-faint uppercase transition hover:border-line2 hover:text-mute"
            >
              Skip
            </button>
          )}
        </div>
      </div>

      {operator && (
        <p className="mt-8 text-center text-[12px] text-faint">
          Teaching @{operator.handle} the overnight path
        </p>
      )}
    </main>
  );
}
