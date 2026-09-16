"use client";

import { useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useOperator } from "@/components/operator-context";
import { isOnboardingComplete } from "@/lib/onboarding";
import { LogoMark } from "@/components/logo";

type Mode = "app" | "onboarding" | "enter";

type Props = {
  mode: Mode;
  children: ReactNode;
};

const SETTLE_MS = 2000;

/**
 * Client product gates (operator session + onboarding).
 * - enter: signed in → onboarding or /desk
 * - onboarding: requires auth; done → /desk
 * - app: requires auth + onboarding complete
 */
export function OperatorGate({ mode, children }: Props) {
  const router = useRouter();
  const { operator, loading } = useOperator();
  const [settled, setSettled] = useState(false);
  const [allowed, setAllowed] = useState(false);
  const [denyReason, setDenyReason] = useState<string | null>(null);
  const [forceSettle, setForceSettle] = useState(false);

  useEffect(() => {
    const id = window.setTimeout(() => setForceSettle(true), SETTLE_MS);
    return () => window.clearTimeout(id);
  }, []);

  useEffect(() => {
    if (loading && !forceSettle) return;

    const identity = operator?.id;
    const onboarded = identity ? isOnboardingComplete(identity) : false;

    if (mode === "enter") {
      if (operator && identity) {
        setDenyReason(null);
        setAllowed(false);
        setSettled(true);
        router.replace(onboarded ? "/desk" : "/onboarding");
        return;
      }
      setDenyReason(null);
      setAllowed(true);
      setSettled(true);
      return;
    }

    if (mode === "onboarding") {
      if (!operator || !identity) {
        setDenyReason("Enter with a handle to continue.");
        setAllowed(false);
        setSettled(true);
        router.replace("/enter?next=/onboarding");
        return;
      }
      if (onboarded) {
        setDenyReason(null);
        setAllowed(false);
        setSettled(true);
        router.replace("/desk");
        return;
      }
      setDenyReason(null);
      setAllowed(true);
      setSettled(true);
      return;
    }

    // mode === "app"
    if (!operator || !identity) {
      setDenyReason("Enter to open the desk.");
      setAllowed(false);
      setSettled(true);
      router.replace("/enter");
      return;
    }
    if (!onboarded) {
      setDenyReason("Finish the short tour before opening the desk.");
      setAllowed(false);
      setSettled(true);
      router.replace("/onboarding");
      return;
    }
    setDenyReason(null);
    setAllowed(true);
    setSettled(true);
  }, [mode, loading, operator, forceSettle, router]);

  if (!settled) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center px-6">
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-10 w-10 items-center justify-center">
            <LogoMark size={28} />
          </div>
          <p className="text-[11px] font-medium tracking-[0.2em] text-faint uppercase">
            Checking session…
          </p>
          <p className="mt-2 max-w-xs text-[12px] text-mute">
            Restoring your operator session.
          </p>
        </div>
      </div>
    );
  }

  if (!allowed) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 px-6 text-center">
        <LogoMark size={28} />
        <p className="text-[18px] font-medium text-ink">
          {denyReason ?? "Redirecting…"}
        </p>
        <p className="text-[11px] tracking-[0.16em] text-faint uppercase">
          Redirecting
        </p>
        <div className="mt-2 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/enter"
            className="rounded-full bg-white px-5 py-2.5 text-[13px] font-semibold text-[#0a0612]"
          >
            Enter
          </Link>
          <Link
            href="/"
            className="rounded-full border border-line px-5 py-2.5 text-[12px] text-mute"
          >
            Home
          </Link>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
