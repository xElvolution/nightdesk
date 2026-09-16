"use client";

import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { LogoMark } from "./logo";

const LINKS = [
  { href: "/#features", label: "Product" },
  { href: "/#how", label: "How it works" },
  { href: "/desk", label: "Open desk" },
];

export function MarketingShell({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const panelId = useId();
  const closeRef = useRef<HTMLButtonElement>(null);
  const menuBtnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
      menuBtnRef.current?.focus();
    };
  }, [open]);

  return (
    <div className="flex min-h-screen flex-col bg-[#050508]">
      <header className="sticky top-0 z-50 px-4 pt-4 md:px-6 md:pt-5">
        <div
          className={`mx-auto flex h-14 max-w-5xl items-center gap-6 rounded-full border px-4 transition-[background,border-color,box-shadow] duration-300 md:h-[58px] md:px-5 ${
            scrolled
              ? "border-white/10 bg-[#0a0812]/85 shadow-[0_12px_40px_rgba(0,0,0,0.45)] backdrop-blur-xl"
              : "border-white/[0.08] bg-white/[0.03] backdrop-blur-md"
          }`}
        >
          <Link href="/" className="flex shrink-0 items-center gap-2.5">
            <LogoMark />
            <span className="text-[13px] font-semibold tracking-[0.18em] text-ink">
              NIGHTDESK
            </span>
          </Link>

          <nav className="ml-auto hidden items-center gap-1 md:flex">
            {LINKS.slice(0, 2).map((l) => (
              <a
                key={l.href}
                href={l.href}
                className="rounded-full px-3.5 py-2 text-[13px] text-mute transition-colors hover:text-ink"
              >
                {l.label}
              </a>
            ))}
            <Link
              href="/desk"
              className="ml-2 inline-flex items-center rounded-full bg-white px-4 py-2 text-[13px] font-semibold text-[#0a0612] transition hover:bg-violet-100"
            >
              Get started
            </Link>
          </nav>

          <button
            ref={menuBtnRef}
            type="button"
            className="ml-auto inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/12 text-ink md:hidden"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            aria-controls={panelId}
            onClick={() => setOpen((v) => !v)}
          >
            <Hamburger open={open} />
          </button>
        </div>
      </header>

      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-[60] md:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <button
              type="button"
              className="absolute inset-0 bg-black/70 backdrop-blur-sm"
              aria-label="Close menu backdrop"
              onClick={() => setOpen(false)}
            />
            <motion.aside
              id={panelId}
              role="dialog"
              aria-modal="true"
              aria-label="Navigation"
              className="absolute right-0 top-0 flex h-full w-[min(100%,320px)] flex-col border-l border-white/10 bg-[#0c0a14] shadow-2xl"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 380, damping: 36 }}
            >
              <div className="flex h-[72px] items-center justify-between border-b border-white/10 px-5">
                <span className="text-[12px] font-semibold tracking-[0.16em] text-ink">
                  MENU
                </span>
                <button
                  ref={closeRef}
                  type="button"
                  className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/12 text-mute hover:text-ink"
                  aria-label="Close menu"
                  onClick={() => setOpen(false)}
                >
                  <CloseIcon />
                </button>
              </div>
              <nav className="flex flex-1 flex-col gap-1 p-4">
                {LINKS.map((l) =>
                  l.href.startsWith("/#") ? (
                    <a
                      key={l.href}
                      href={l.href}
                      className="rounded-xl px-3 py-3.5 text-[15px] text-ink hover:bg-violet-500/10"
                      onClick={() => setOpen(false)}
                    >
                      {l.label}
                    </a>
                  ) : (
                    <Link
                      key={l.href}
                      href={l.href}
                      className="rounded-xl px-3 py-3.5 text-[15px] text-ink hover:bg-violet-500/10"
                      onClick={() => setOpen(false)}
                    >
                      {l.label}
                    </Link>
                  ),
                )}
              </nav>
              <div className="border-t border-white/10 p-4">
                <Link
                  href="/desk"
                  className="flex w-full items-center justify-center rounded-full bg-white px-4 py-3 text-[14px] font-semibold text-[#0a0612]"
                  onClick={() => setOpen(false)}
                >
                  Get started
                </Link>
              </div>
            </motion.aside>
          </motion.div>
        )}
      </AnimatePresence>

      <main className="flex-1">{children}</main>

      <footer className="border-t border-white/[0.06]">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-5 py-10 text-[12px] text-faint md:px-6">
          <span>NightDesk · XElvolution · MIT</span>
          <div className="flex gap-5">
            <a href="/#features" className="hover:text-mute">
              Product
            </a>
            <Link href="/desk" className="hover:text-mute">
              Desk
            </Link>
            <a
              href="https://github.com/xElvolution/nightdesk"
              className="hover:text-mute"
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

function Hamburger({ open }: { open: boolean }) {
  return (
    <span className="relative block h-3.5 w-4">
      <span
        className={`absolute left-0 top-0 h-0.5 w-4 rounded bg-ink transition-transform duration-200 ${
          open ? "translate-y-[6px] rotate-45" : ""
        }`}
      />
      <span
        className={`absolute left-0 top-[6px] h-0.5 w-4 rounded bg-ink transition-opacity duration-200 ${
          open ? "opacity-0" : "opacity-100"
        }`}
      />
      <span
        className={`absolute left-0 top-[12px] h-0.5 w-4 rounded bg-ink transition-transform duration-200 ${
          open ? "-translate-y-[6px] -rotate-45" : ""
        }`}
      />
    </span>
  );
}

function CloseIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
      <path d="M2 2l10 10M12 2L2 12" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}
