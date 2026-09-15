"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cls } from "@/lib/format";

const LINKS = [
  { href: "/desk", label: "Desk" },
  { href: "/risk", label: "Risk" },
  { href: "/orders", label: "Orders" },
  { href: "/paper", label: "Paper" },
  { href: "/audit", label: "Audit" },
  { href: "/backtest", label: "Backtest" },
];

export function Nav() {
  const path = usePathname();
  return (
    <nav className="flex items-center gap-1 overflow-x-auto text-[12px]">
      {LINKS.map((l) => {
        const on = path === l.href || path.startsWith(l.href + "/");
        return (
          <Link
            key={l.href}
            href={l.href}
            className={cls(
              "rounded-md px-2.5 py-1.5 tracking-wide transition-colors",
              on ? "bg-panel2 text-ink" : "text-mute hover:text-ink",
            )}
          >
            {l.label}
          </Link>
        );
      })}
    </nav>
  );
}
