"use client";

import { DeskProvider } from "./desk-context";

export function Providers({ children }: { children: React.ReactNode }) {
  return <DeskProvider>{children}</DeskProvider>;
}
