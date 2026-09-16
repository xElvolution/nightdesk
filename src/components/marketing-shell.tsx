"use client";

import Link from "next/link";

const LINKS = [
  { href: "/#product", label: "PRODUCT" },
  { href: "/#how", label: "HOW" },
  { href: "/enter", label: "OPEN" },
];

export function MarketingShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="mkt relative flex min-h-screen flex-col">
      <div className="mkt-grain" aria-hidden />

      <header className="relative z-20">
        <nav className="mx-auto flex max-w-6xl items-center justify-between px-5 pt-5 pb-4 md:px-8 md:pt-6 md:pb-5">
          {LINKS.map((l) =>
            l.href.startsWith("/#") ? (
              <a
                key={l.href}
                href={l.href}
                className="mkt-nav-link"
              >
                {l.label}
              </a>
            ) : (
              <Link key={l.href} href={l.href} className="mkt-nav-link">
                {l.label}
              </Link>
            ),
          )}
        </nav>
        <div className="mkt-rule" />
      </header>

      <main className="relative z-10 flex-1">{children}</main>

      <footer className="relative z-10 border-t border-[var(--mkt-red)]/25">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-5 py-8 text-[11px] font-medium tracking-[0.14em] text-[var(--mkt-ink)]/55 uppercase md:px-8">
          <span>NightDesk · XElvolution · MIT</span>
          <div className="flex gap-6">
            <a href="/#product" className="hover:text-[var(--mkt-red)]">
              Product
            </a>
            <Link href="/enter" className="hover:text-[var(--mkt-red)]">
              Open desk
            </Link>
            <a
              href="https://github.com/xElvolution/nightdesk"
              className="hover:text-[var(--mkt-red)]"
              target="_blank"
              rel="noreferrer"
            >
              GitHub
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
