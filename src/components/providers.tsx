"use client";

import { DeskProvider } from "./desk-context";
import { OperatorProvider } from "./operator-context";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <OperatorProvider>
      <DeskProvider>{children}</DeskProvider>
    </OperatorProvider>
  );
}
