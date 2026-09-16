"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, Suspense, useState } from "react";
import { LogoMark } from "@/components/logo";
import { useOperator } from "@/components/operator-context";

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
    <div className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-5 py-16">
      <div className="mb-8 flex items-center gap-2.5">
        <LogoMark size={28} />
        <span className="text-[12px] font-semibold tracking-[0.16em] text-ink">
          NIGHTDESK
        </span>
      </div>
      <h1 className="text-[28px] font-semibold tracking-[-0.03em] text-ink">
        Enter as operator
      </h1>
      <p className="mt-3 text-[14px] leading-6 text-mute">
        Your desk, blotter, and audit chain stay bound to this handle. Session
        persists across refresh.
      </p>

      <form onSubmit={onSubmit} className="mt-8 space-y-4">
        <label className="block">
          <span className="text-[11px] font-medium tracking-[0.12em] text-faint uppercase">
            Display name
          </span>
          <input
            required
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="Ada Okonkwo"
            className="mt-1.5 w-full rounded-xl border border-line bg-surface px-3.5 py-2.5 text-[14px] text-ink outline-none focus:border-accent/50"
            autoComplete="name"
          />
        </label>
        <label className="block">
          <span className="text-[11px] font-medium tracking-[0.12em] text-faint uppercase">
            Handle
          </span>
          <div className="mt-1.5 flex items-center rounded-xl border border-line bg-surface focus-within:border-accent/50">
            <span className="pl-3.5 text-[14px] text-faint">@</span>
            <input
              required
              value={handle}
              onChange={(e) => setHandle(e.target.value)}
              placeholder="ada.desk"
              className="w-full bg-transparent px-2 py-2.5 text-[14px] text-ink outline-none"
              autoComplete="username"
            />
          </div>
        </label>
        <label className="block">
          <span className="text-[11px] font-medium tracking-[0.12em] text-faint uppercase">
            Email <span className="normal-case tracking-normal text-faint">(optional)</span>
          </span>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@firm.desk"
            className="mt-1.5 w-full rounded-xl border border-line bg-surface px-3.5 py-2.5 text-[14px] text-ink outline-none focus:border-accent/50"
            autoComplete="email"
          />
        </label>

        {error && <p className="text-[13px] text-loss">{error}</p>}

        <button
          type="submit"
          disabled={busy}
          className="inline-flex w-full items-center justify-center rounded-full bg-white px-5 py-3 text-[14px] font-semibold text-[#0a0612] disabled:opacity-50"
        >
          {busy ? "Opening desk..." : "Open desk"}
        </button>
      </form>

      <p className="mt-6 text-[12px] text-faint">
        Returning operator? Use the same handle.{" "}
        <Link href="/" className="text-mute hover:text-ink">
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
        <div className="mx-auto max-w-md px-5 py-24 text-[13px] text-mute">
          Loading…
        </div>
      }
    >
      <EnterForm />
    </Suspense>
  );
}
