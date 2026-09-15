"use client";

import { usePathname } from "next/navigation";
import { MarketingShell } from "./marketing-shell";
import { AppShell } from "./app-shell";

const APP_PREFIXES = ["/desk", "/risk", "/orders", "/paper", "/audit", "/backtest"];

export function Shell({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  const isApp = APP_PREFIXES.some((p) => path === p || path.startsWith(p + "/"));
  if (isApp) return <AppShell>{children}</AppShell>;
  return <MarketingShell>{children}</MarketingShell>;
}
