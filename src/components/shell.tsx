import Link from "next/link";
import { Nav } from "./nav";
import { Ticker } from "./ticker";
import { VenueStatus } from "./venue-status";

export function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-40 border-b border-line bg-bg/85 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center gap-6 px-5 py-3">
          <Link href="/" className="flex items-center gap-2.5 shrink-0">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-amber/40 bg-panel">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
                <path d="M8 1.5v3.5" stroke="#e3b56a" strokeWidth="1.6" />
                <circle cx="8" cy="1.4" r="1.1" fill="#e3b56a" />
                <rect x="3" y="5" width="10" height="8" rx="1.2" stroke="#e3b56a" />
              </svg>
            </span>
            <span className="text-[13px] font-semibold tracking-[0.18em] text-ink">
              NIGHTDESK
            </span>
          </Link>
          <Nav />
          <div className="ml-auto hidden items-center gap-3 md:flex">
            <VenueStatus />
          </div>
        </div>
        <Ticker />
      </header>
      <main className="flex-1">{children}</main>
      <footer className="border-t border-line">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-5 py-4 text-[11px] text-faint">
          <span>NightDesk · XElvolution · MIT</span>
          <span>Bitget rToken overnight desk</span>
        </div>
      </footer>
    </div>
  );
}
