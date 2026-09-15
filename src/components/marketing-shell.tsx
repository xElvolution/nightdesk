"use client";

import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { LogoMark } from "./logo";

const LINKS = [
  { href: "/#product", label: "Product" },
  { href: "/#agents", label: "Agents" },
  { href: "/#risk", label: "Risk" },
  { href: "/desk", label: "Open desk" },
];

export function MarketingShell({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const panelId = useId();
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
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
    };
  }, [open]);

  return (
    <div className="min-h-screen flex flex-col bg-bg">
      <header
        className={`sticky top-0 z-50 transition-[background,border-color,backdrop-filter] duration-300 ${
          scrolled
            ? "border-b border-line bg-bg/80 backdrop-blur-xl"
            : "border-b border-transparent bg-transparent"
        }`}
      >
        <div className="mx-auto flex h-16 max-w-6xl items-center gap-8 px-5">
          <Link href="/" className="flex items-center gap-2.5 shrink-0">
            <LogoMark />
            <span className="text-[13px] font-semibold tracking-[0.16em] text-ink">
              NIGHTDESK
            </span>
          </Link>

          <nav className="ml-auto hidden items-center gap-1 md:flex">
            {LINKS.slice(0, 3).map((l) => (
              <a
                key={l.href}
                href={l.href}
                className="rounded-lg px-3 py-2 text-[13px] text-mute transition-colors hover:text-ink"
              >
                {l.label}
              </a>
            ))}
            <Link
              href="/desk"
              className="btn-primary ml-2 px-4 py-2 text-[13px]"
            >
              Open desk
            </Link>
          </nav>

          <button
            type="button"
            className="ml-auto inline-flex h-10 w-10 items-center justify-center rounded-xl border border-line text-ink md:hidden"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            aria-controls={panelId}
            onClick={() => setOpen((v) => !v)}
          >
            <span className="sr-only">Menu</span>
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
          >
            <button
              type="button"
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              aria-label="Close menu backdrop"
              onClick={() => setOpen(false)}
            />
            <motion.aside
              id={panelId}
              role="dialog"
              aria-modal="true"
              aria-label="Navigation"
              className="absolute right-0 top-0 flex h-full w-[min(100%,320px)] flex-col border-l border-line bg-surface shadow-2xl"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 380, damping: 36 }}
            >
              <div className="flex h-16 items-center justify-between border-b border-line px-4">
                <span className="text-[12px] font-semibold tracking-[0.16em] text-ink">
                  MENU
                </span>
                <button
                  ref={closeRef}
                  type="button"
                  className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-line text-mute hover:text-ink"
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
                      className="rounded-xl px-3 py-3 text-[15px] text-ink hover:bg-surface2"
                      onClick={() => setOpen(false)}
                    >
                      {l.label}
                    </a>
                  ) : (
                    <Link
                      key={l.href}
                      href={l.href}
                      className="rounded-xl px-3 py-3 text-[15px] text-ink hover:bg-surface2"
                      onClick={() => setOpen(false)}
                    >
                      {l.label}
                    </Link>
                  ),
                )}
              </nav>
              <div className="border-t border-line p-4">
                <Link
                  href="/desk"
                  className="btn-primary flex w-full items-center justify-center px-4 py-3 text-[14px]"
                  onClick={() => setOpen(false)}
                >
                  Open desk
                </Link>
              </div>
            </motion.aside>
          </motion.div>
        )}
      </AnimatePresence>

      <main className="flex-1">{children}</main>

      <footer className="border-t border-line">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-5 py-8 text-[12px] text-faint">
          <span>NightDesk · XElvolution · MIT</span>
          <span>Bitget rToken overnight desk</span>
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
