"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { parseHoldingsCsv } from "@/lib/holdings";
import { bookToAccount } from "@/lib/holdings";
import { planRebalance } from "@/lib/rebalance";
import { bookQuotes, quoteAt } from "@/lib/market/quotes";
import { detectAnomalies } from "@/lib/agents/execution";
import { applyFill, makeFill, markAccount } from "@/lib/paper/account";
import { appendAudit } from "@/lib/audit/log";
import { PREVIEW_MS } from "@/lib/universe";
import { runCycle } from "@/lib/agents/orchestrator";
import type {
  AuditEvent,
  BookFile,
  DeskCycle,
  Fill,
  PaperAccount,
  RebalancePlan,
} from "@/lib/types";

type Phase =
  | "empty"
  | "loaded"
  | "watching"
  | "proposed"
  | "arming"
  | "filled"
  | "cancelled";

interface DeskCtx {
  phase: Phase;
  book: BookFile | null;
  account: PaperAccount | null;
  plan: RebalancePlan | null;
  fills: Fill[];
  audit: AuditEvent[];
  cycles: DeskCycle[];
  killSwitch: boolean;
  remainingMs: number;
  anomalies: string[];
  error: string | null;
  hydrated: boolean;
  setKillSwitch: (v: boolean) => void;
  loadCsv: (raw: string, name: string) => Promise<void>;
  runCycleNow: () => void;
  submitPlan: () => void;
  cancel: () => void;
  clearDesk: () => Promise<void>;
}

const Ctx = createContext<DeskCtx | null>(null);
const LOCAL = "nightdesk.ledger.v2";

export function DeskProvider({ children }: { children: React.ReactNode }) {
  const [phase, setPhase] = useState<Phase>("empty");
  const [book, setBook] = useState<BookFile | null>(null);
  const [account, setAccount] = useState<PaperAccount | null>(null);
  const [plan, setPlan] = useState<RebalancePlan | null>(null);
  const [fills, setFills] = useState<Fill[]>([]);
  const [audit, setAudit] = useState<AuditEvent[]>([]);
  const [cycles, setCycles] = useState<DeskCycle[]>([]);
  const [killSwitch, setKillSwitch] = useState(false);
  const [remainingMs, setRemainingMs] = useState(0);
  const [anomalies, setAnomalies] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const armTimer = useRef<number | null>(null);

  const persist = useCallback(async (next: {
    book: BookFile | null;
    fills: Fill[];
    audit: AuditEvent[];
    account: PaperAccount | null;
  }) => {
    try {
      localStorage.setItem(LOCAL, JSON.stringify(next));
    } catch {
      /* ignore */
    }
    try {
      await fetch("/api/ledger", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          csv: next.book?.raw,
          name: next.book?.name,
          fills: next.fills,
          audit: next.audit,
          clear: !next.book && next.fills.length === 0,
        }),
      });
    } catch {
      /* server ledger is best-effort */
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/ledger", { cache: "no-store" });
        if (res.ok) {
          const remote = (await res.json()) as {
            book: BookFile | null;
            fills: Fill[];
            audit: AuditEvent[];
            account: PaperAccount | null;
          };
          if (!cancelled && remote.book) {
            setBook(remote.book);
            setAccount(remote.account ?? bookToAccount(remote.book));
            setFills(remote.fills ?? []);
            setAudit(remote.audit ?? []);
            setPhase("loaded");
            setHydrated(true);
            return;
          }
        }
      } catch {
        /* fall through */
      }
      try {
        const raw = localStorage.getItem(LOCAL);
        if (raw && !cancelled) {
          const s = JSON.parse(raw) as {
            book?: BookFile;
            fills?: Fill[];
            audit?: AuditEvent[];
            account?: PaperAccount;
          };
          if (s.book) {
            setBook(s.book);
            setAccount(s.account ?? bookToAccount(s.book));
            setFills(s.fills ?? []);
            setAudit(s.audit ?? []);
            setPhase("loaded");
          }
        }
      } catch {
        /* ignore */
      }
      if (!cancelled) setHydrated(true);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    return () => {
      if (armTimer.current) window.clearInterval(armTimer.current);
    };
  }, []);

  const log = useCallback(
    (actor: AuditEvent["actor"], action: string, detail: string, symbol?: AuditEvent["symbol"]) => {
      setAudit((prev) => {
        const next = prev.slice();
        appendAudit(next, { ts: Date.now(), actor, action, detail, symbol });
        return next;
      });
    },
    [],
  );

  const loadCsv = useCallback(
    async (raw: string, name: string) => {
      try {
        const b = parseHoldingsCsv(raw, name);
        b.raw = raw;
        const acc = bookToAccount(b);
        setBook(b);
        setAccount(acc);
        setPlan(null);
        setCycles([]);
        setPhase("loaded");
        setError(null);
        setAnomalies([]);
        log("operator", "book.import", `Imported ${name} · ${b.lots.length} lots · cash ${b.cashUsdt.toFixed(0)} USDT.`);
        await persist({ book: b, fills, audit, account: acc });
      } catch (e) {
        setError(e instanceof Error ? e.message : "CSV parse failed.");
      }
    },
    [audit, fills, log, persist],
  );

  const runCycleNow = useCallback(() => {
    if (!book) return;
    setPhase("watching");
    setAnomalies([]);
    log("system", "cycle.start", "Desk cycle started across research, sentiment, risk, execution.");
    const ts = Date.now();
    const acc = bookToAccount(book, ts);
    const nextCycles = book.lots.map((l, i) => runCycle(l.symbol, ts + i * 17, acc, killSwitch));
    window.setTimeout(() => {
      setCycles(nextCycles);
      for (const c of nextCycles) {
        log("research", "brief", c.research.thesis, c.symbol);
        log("sentiment", "print", `Score ${c.sentiment.score} (${c.sentiment.heat}).`, c.symbol);
        log(
          "risk",
          "gate",
          `Verdict ${c.risk.verdict}. ${c.risk.results.filter((r) => !r.passed).length} rules tripped.`,
          c.symbol,
        );
        log("execution", "receipt", `${c.receipt.kind.toUpperCase()} ${c.receipt.qty} · ${c.receipt.hash}`, c.symbol);
      }
      const p = planRebalance(book, Date.now(), killSwitch);
      setPlan(p);
      setAccount(acc);
      setPhase("proposed");
      log("execution", "proposal", p.summary);
      void persist({ book, fills, audit, account: acc });
    }, 700);
  }, [audit, book, fills, killSwitch, log, persist]);

  const cancel = useCallback(() => {
    if (armTimer.current) window.clearInterval(armTimer.current);
    setPhase("cancelled");
    setRemainingMs(0);
    log("operator", "cancel", "Operator cancelled the armed order. No fill.");
  }, [log]);

  const submitPlan = useCallback(() => {
    if (!plan || !book) return;
    if (killSwitch) {
      setPhase("cancelled");
      setAnomalies(["kill_switch"]);
      log("system", "kill", "Kill switch blocked submission.");
      return;
    }
    if (armTimer.current) window.clearInterval(armTimer.current);
    setPhase("arming");
    setRemainingMs(PREVIEW_MS);
    log("execution", "arm", `Order preview armed for ${PREVIEW_MS / 1000}s. Cancel-on-anomaly active.`);
    const started = Date.now();
    armTimer.current = window.setInterval(() => {
      const left = PREVIEW_MS - (Date.now() - started);
      setRemainingMs(Math.max(0, left));
      const hits: string[] = [];
      for (const leg of plan.legs) {
        const q = quoteAt(leg.symbol, Date.now());
        const cycle = runCycle(leg.symbol, Date.now(), bookToAccount(book), killSwitch);
        const preview = {
          id: "arm",
          symbol: leg.symbol,
          side: leg.side,
          qty: leg.qty,
          limitPrice: leg.limitPrice,
          notional: leg.notional,
          status: "preview" as const,
          research: cycle.research,
          sentiment: cycle.sentiment,
          risk: leg.risk,
          anomalies: [] as [],
          previewUntil: started + PREVIEW_MS,
          createdAt: started,
        };
        hits.push(...detectAnomalies(q, preview));
      }
      const uniq = Array.from(new Set(hits));
      if (uniq.length) {
        if (armTimer.current) window.clearInterval(armTimer.current);
        setAnomalies(uniq);
        setPhase("cancelled");
        log("execution", "cancel-on-anomaly", `Cancelled: ${uniq.join(", ")}.`);
      } else if (left <= 0) {
        if (armTimer.current) window.clearInterval(armTimer.current);
        let acc = bookToAccount(book);
        const newFills: Fill[] = [];
        for (const leg of plan.legs) {
          const q = quoteAt(leg.symbol, Date.now());
          const px = leg.side === "sell" ? q.bid : q.ask;
          const fill = makeFill({
            orderId: `ord_${leg.symbol}_${started}`,
            symbol: leg.symbol,
            side: leg.side,
            qty: leg.qty,
            price: px,
            ts: Date.now(),
          });
          acc = applyFill(acc, fill);
          newFills.push(fill);
          log(
            "execution",
            "fill",
            `${fill.side} ${fill.qty} ${fill.symbol} @ ${fill.price.toFixed(2)} · fee ${fill.feeUsdt.toFixed(2)} USDT · ${leg.receipt.hash}`,
            fill.symbol,
          );
        }
        acc = markAccount(acc, bookQuotes(Date.now()));
        const nextFills = [...newFills, ...fills];
        setAccount(acc);
        setFills(nextFills);
        setPhase("filled");
        setBook((prev) => {
          if (!prev) return prev;
          const lots = prev.lots
            .map((lot) => {
              const leg = plan.legs.find((l) => l.symbol === lot.symbol);
              if (!leg) return lot;
              return { ...lot, qty: leg.toQty };
            })
            .filter((l) => l.qty !== 0);
          const nextBook = {
            ...prev,
            lots,
            cashUsdt: acc.cashUsdt,
          };
          void persist({ book: nextBook, fills: nextFills, audit, account: acc });
          return nextBook;
        });
        log("system", "order.done", `Filled ${newFills.length} legs. Ledger updated.`);
      }
    }, 250) as unknown as number;
  }, [audit, book, fills, killSwitch, log, persist, plan]);

  const clearDesk = useCallback(async () => {
    if (armTimer.current) window.clearInterval(armTimer.current);
    setPhase("empty");
    setBook(null);
    setAccount(null);
    setPlan(null);
    setCycles([]);
    setAnomalies([]);
    setRemainingMs(0);
    setError(null);
    setFills([]);
    setAudit([]);
    localStorage.removeItem(LOCAL);
    await persist({ book: null, fills: [], audit: [], account: null });
  }, [persist]);

  const value = useMemo<DeskCtx>(
    () => ({
      phase,
      book,
      account,
      plan,
      fills,
      audit,
      cycles,
      killSwitch,
      remainingMs,
      anomalies,
      error,
      hydrated,
      setKillSwitch,
      loadCsv,
      runCycleNow,
      submitPlan,
      cancel,
      clearDesk,
    }),
    [
      phase,
      book,
      account,
      plan,
      fills,
      audit,
      cycles,
      killSwitch,
      remainingMs,
      anomalies,
      error,
      hydrated,
      loadCsv,
      runCycleNow,
      submitPlan,
      cancel,
      clearDesk,
    ],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useDesk() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useDesk outside provider");
  return v;
}
