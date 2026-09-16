"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

export interface OperatorPublic {
  id: string;
  displayName: string;
  handle: string;
  email?: string;
  initials: string;
  lastSeenAt: number;
}

interface OperatorCtx {
  operator: OperatorPublic | null;
  loading: boolean;
  refresh: () => Promise<void>;
  signOut: () => Promise<void>;
}

const Ctx = createContext<OperatorCtx | null>(null);

export function OperatorProvider({ children }: { children: React.ReactNode }) {
  const [operator, setOperator] = useState<OperatorPublic | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/me", { cache: "no-store" });
      if (!res.ok) {
        setOperator(null);
        return;
      }
      const data = (await res.json()) as { operator: OperatorPublic | null };
      setOperator(data.operator);
    } catch {
      setOperator(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const signOut = useCallback(async () => {
    await fetch("/api/auth/signout", { method: "POST" });
    setOperator(null);
    window.location.href = "/enter";
  }, []);

  const value = useMemo(
    () => ({ operator, loading, refresh, signOut }),
    [operator, loading, refresh, signOut],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useOperator() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useOperator outside provider");
  return v;
}
