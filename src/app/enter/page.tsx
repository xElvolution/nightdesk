"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, Suspense, useState } from "react";
import { LogoMark } from "@/components/logo";
import { useOperator } from "@/components/operator-context";
import { NotchFrame } from "@/components/notch-frame";

function EnterForm() {
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get("next") || "/desk";
  const { refresh } = useOperator();
  const [displayName, setDisplayName] = useState("");
  const [handle, setHandle] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/enter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ displayName, handle, email: email || undefined }),
      });
      const data = (await res.json()) as { ok?: boolean; error?: string };
      if (!res.ok || !data.ok) {
        setError(data.error || "Could not open desk.");
        setBusy(false);
        return;
      }
      await refresh();
      router.replace(next.startsWith("/") ? next : "/desk");
    } catch {
      setError("Network error. Try again.");
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-lg flex-col justify-center px-5 py-16">
      <div className="mb-8 flex items-center gap-2.5">
        <LogoMark size={28} variant="marketing" />
        <span className="font-[family-name:var(--font-display)] text-[13px] font-bold tracking-[0.2em] text-[var(--mkt-red)] uppercase">
          NIGHTDESK
        </span>
      </div>

      <NotchFrame>
        <h1 className="font-[family-name:var(--font-display)] text-[32px] font-bold tracking-[-0.03em] text-[var(--mkt-red)] uppercase md:text-[36px]">
          Enter as operator
        </h1>
        <p className="mt-3 text-[14px] leading-6 text-[var(--mkt-ink)]/70">
          Your desk, blotter, and audit chain stay bound to this handle. Session
          persists across refresh.
        </p>

        <form onSubmit={onSubmit} className="mt-8 space-y-4">
          <label className="block">
            <span className="text-[11px] font-semibold tracking-[0.14em] text-[var(--mkt-red)] uppercase">
              Display name
            </span>
            <input
              required
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Ada Okonkwo"
              className="mt-1.5 w-full border border-[var(--mkt-red)]/35 bg-[var(--mkt-cream)] px-3.5 py-2.5 text-[14px] text-[var(--mkt-ink)] outline-none focus:border-[var(--mkt-red)]"
              autoComplete="name"
            />
          </label>
          <label className="block">
            <span className="text-[11px] font-semibold tracking-[0.14em] text-[var(--mkt-red)] uppercase">
              Handle
            </span>
            <div className="mt-1.5 flex items-center border border-[var(--mkt-red)]/35 bg-[var(--mkt-cream)] focus-within:border-[var(--mkt-red)]">
              <span className="pl-3.5 text-[14px] text-[var(--mkt-ink)]/45">@</span>
              <input
                required
                value={handle}
                onChange={(e) => setHandle(e.target.value)}
                placeholder="ada.desk"
                className="w-full bg-transparent px-2 py-2.5 text-[14px] text-[var(--mkt-ink)] outline-none"
                autoComplete="username"
              />
            </div>
          </label>
          <label className="block">
            <span className="text-[11px] font-semibold tracking-[0.14em] text-[var(--mkt-red)] uppercase">
              Email{" "}
              <span className="normal-case tracking-normal opacity-60">(optional)</span>
            </span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@firm.desk"
              className="mt-1.5 w-full border border-[var(--mkt-red)]/35 bg-[var(--mkt-cream)] px-3.5 py-2.5 text-[14px] text-[var(--mkt-ink)] outline-none focus:border-[var(--mkt-red)]"
              autoComplete="email"
            />
          </label>

          {error && <p className="text-[13px] text-[var(--mkt-red)]">{error}</p>}

          <button
            type="submit"
            disabled={busy}
            className="inline-flex h-11 w-full items-center justify-center px-5 text-[13px] disabled:opacity-50"
          >
            {busy ? "Opening desk..." : "Open desk"}
          </button>
        </form>
      </NotchFrame>

      <p className="mt-6 text-[12px] text-[var(--mkt-ink)]/50">
        Returning operator? Use the same handle.{" "}
        <Link href="/" className="text-[var(--mkt-red)] hover:opacity-70">
          Back to marketing
        </Link>
      </p>
    </div>
  );
}

export default function EnterPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-md px-5 py-24 text-[13px] text-[var(--mkt-ink)]/55">
          Loading…
        </div>
      }
    >
      <EnterForm />
    </Suspense>
  );
}
