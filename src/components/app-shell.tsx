"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { cls } from "@/lib/format";
import { LogoMark } from "./logo";
import { Ticker } from "./ticker";
import { VenueStatus } from "./venue-status";
import { useOperator } from "./operator-context";

const LINKS = [
  { href: "/desk", label: "Desk", icon: DeskIcon },
  { href: "/risk", label: "Risk", icon: RiskIcon },
  { href: "/orders", label: "Orders", icon: OrdersIcon },
  { href: "/blotter", label: "Blotter", icon: PaperIcon },
  { href: "/audit", label: "Audit", icon: AuditIcon },
  { href: "/backtest", label: "Backtest", icon: BacktestIcon },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  const { operator, signOut } = useOperator();
  const [open, setOpen] = useState(false);
  const panelId = useId();
  const closeRef = useRef<HTMLButtonElement>(null);
  const menuBtnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    setOpen(false);
  }, [path]);

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
    <div className="flex min-h-screen bg-bg">
      {/* Desktop sidebar: app routes only */}
      <aside className="sticky top-0 hidden h-screen w-[64px] shrink-0 flex-col border-r border-line bg-surface lg:flex xl:w-[196px]">
        <Link
          href="/"
          className="flex h-12 items-center gap-2.5 border-b border-line px-3 xl:px-4"
        >
          <LogoMark size={24} />
          <span className="hidden text-[11px] font-semibold tracking-[0.16em] text-ink xl:inline">
            NIGHTDESK
          </span>
        </Link>
        <nav className="flex flex-1 flex-col gap-0.5 p-1.5">
          {LINKS.map((l) => {
            const on = path === l.href || path.startsWith(l.href + "/");
            const Icon = l.icon;
            return (
              <Link
                key={l.href}
                href={l.href}
                title={l.label}
                className={cls(
                  "group flex items-center gap-3 rounded-lg px-2.5 py-2 text-[12px] transition-colors",
                  on
                    ? "bg-accent/10 text-accent shadow-[inset_0_0_0_1px_rgba(77,232,255,0.18)]"
                    : "text-mute hover:bg-surface2 hover:text-ink",
                )}
              >
                <Icon active={on} />
                <span className="hidden tracking-wide xl:inline">{l.label}</span>
              </Link>
            );
          })}
        </nav>
        <div className="hidden border-t border-line p-3 xl:block">
          <VenueStatus />
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-40 border-b border-line bg-bg/90 backdrop-blur-xl">
          <div className="flex h-11 items-center gap-3 px-3 lg:px-4">
            <button
              ref={menuBtnRef}
              type="button"
              className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-line text-ink lg:hidden"
              aria-label={open ? "Close navigation" : "Open navigation"}
              aria-expanded={open}
              aria-controls={panelId}
              onClick={() => setOpen((v) => !v)}
            >
              <Hamburger open={open} />
            </button>
            <Link href="/" className="flex items-center gap-2 lg:hidden">
              <LogoMark size={22} />
              <span className="text-[11px] font-semibold tracking-[0.14em]">
                NIGHTDESK
              </span>
            </Link>
            <div className="ml-auto flex items-center gap-3">
              <div className="hidden sm:block">
                <VenueStatus />
              </div>
              {operator && (
                <div className="flex items-center gap-2 rounded-lg border border-line bg-surface px-2 py-1">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-accent/15 text-[9px] font-semibold text-accent">
                    {operator.initials}
                  </span>
                  <div className="hidden min-w-0 sm:block">
                    <div className="truncate text-[11px] font-medium text-ink">{operator.displayName}</div>
                    <div className="truncate text-[10px] text-faint">@{operator.handle} · on desk</div>
                  </div>
                  <button
                    type="button"
                    onClick={() => void signOut()}
                    className="rounded px-1.5 py-0.5 text-[10px] text-mute hover:text-ink"
                  >
                    Sign out
                  </button>
                </div>
              )}
              <Link
                href="/"
                className="hidden rounded-lg px-2 py-1 text-[11px] text-mute hover:text-ink xl:inline"
              >
                Site
              </Link>
            </div>
          </div>
          <Ticker />
        </header>

        <main className="desk-scroll flex-1 overflow-auto">{children}</main>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-[70] lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <button
              type="button"
              className="absolute inset-0 bg-black/65 backdrop-blur-sm"
              aria-label="Close navigation backdrop"
              onClick={() => setOpen(false)}
            />
            <motion.aside
              id={panelId}
              role="dialog"
              aria-modal="true"
              aria-label="App navigation"
              className="absolute left-0 top-0 flex h-full w-[min(100%,292px)] flex-col border-r border-line bg-surface"
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", stiffness: 380, damping: 36 }}
            >
              <div className="flex h-12 items-center justify-between border-b border-line px-4">
                <div className="flex items-center gap-2">
                  <LogoMark size={22} />
                  <span className="text-[11px] font-semibold tracking-[0.14em]">
                    NIGHTDESK
                  </span>
                </div>
                <button
                  ref={closeRef}
                  type="button"
                  className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-line text-mute"
                  aria-label="Close navigation"
                  onClick={() => setOpen(false)}
                >
                  <CloseIcon />
                </button>
              </div>
              <nav className="flex flex-1 flex-col gap-0.5 p-2">
                {LINKS.map((l) => {
                  const on = path === l.href || path.startsWith(l.href + "/");
                  const Icon = l.icon;
                  return (
                    <Link
                      key={l.href}
                      href={l.href}
                      className={cls(
                        "flex items-center gap-3 rounded-lg px-3 py-2.5 text-[13px]",
                        on
                          ? "bg-accent/10 text-accent"
                          : "text-mute hover:bg-surface2 hover:text-ink",
                      )}
                      onClick={() => setOpen(false)}
                    >
                      <Icon active={on} />
                      {l.label}
                    </Link>
                  );
                })}
              </nav>
              <div className="border-t border-line p-3">
                <VenueStatus />
              </div>
            </motion.aside>
          </motion.div>
        )}
      </AnimatePresence>
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

function DeskIcon({ active }: { active?: boolean }) {
  const c = active ? "#4DE8FF" : "currentColor";
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
      <rect x="2" y="3" width="12" height="10" rx="1.5" stroke={c} />
      <path d="M2 7h12" stroke={c} />
    </svg>
  );
}
function RiskIcon({ active }: { active?: boolean }) {
  const c = active ? "#4DE8FF" : "currentColor";
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
      <path d="M8 2l6 11H2L8 2z" stroke={c} />
      <path d="M8 7v3" stroke={c} />
      <circle cx="8" cy="11.5" r="0.7" fill={c} />
    </svg>
  );
}
function OrdersIcon({ active }: { active?: boolean }) {
  const c = active ? "#4DE8FF" : "currentColor";
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
      <path d="M3 4h10M3 8h10M3 12h7" stroke={c} strokeLinecap="round" />
    </svg>
  );
}
function PaperIcon({ active }: { active?: boolean }) {
  const c = active ? "#4DE8FF" : "currentColor";
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
      <rect x="3" y="2" width="10" height="12" rx="1.5" stroke={c} />
      <path d="M6 6h4M6 9h4" stroke={c} />
    </svg>
  );
}
function AuditIcon({ active }: { active?: boolean }) {
  const c = active ? "#4DE8FF" : "currentColor";
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
      <circle cx="8" cy="8" r="5.5" stroke={c} />
      <path d="M8 5v3.5l2 1.5" stroke={c} strokeLinecap="round" />
    </svg>
  );
}
function BacktestIcon({ active }: { active?: boolean }) {
  const c = active ? "#4DE8FF" : "currentColor";
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
      <path
        d="M2 12l3.5-4 3 2.5L14 4"
        stroke={c}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
