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
import { bundleReceipts, sealReceipt } from "@/lib/agents/receipt";
import { applyFill, makeFill, markAccount } from "@/lib/paper/account";
import { appendAudit } from "@/lib/audit/log";
import { PREVIEW_MS } from "@/lib/universe";
import type {
  ActionReceipt,
  AuditEvent,
  BookFile,
  DeskCycle,
  Fill,
  PaperAccount,
  RebalancePlan,
} from "@/lib/types";
import { useOperator } from "./operator-context";

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
  /** Sealed receipts after submit (proof of the night). */
  nightReceipts: ActionReceipt[];
  nightBundleHash: string | null;
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
const LOCAL_BASE = "nightdesk.ledger.v3";

export function DeskProvider({ children }: { children: React.ReactNode }) {
  const { operator, loading: opLoading } = useOperator();
  const localKey = operator ? `${LOCAL_BASE}.${operator.id}` : LOCAL_BASE;
  const [phase, setPhase] = useState<Phase>("empty");
  const [book, setBook] = useState<BookFile | null>(null);
  const [account, setAccount] = useState<PaperAccount | null>(null);
  const [plan, setPlan] = useState<RebalancePlan | null>(null);
  const [fills, setFills] = useState<Fill[]>([]);
  const [audit, setAudit] = useState<AuditEvent[]>([]);
  const [cycles, setCycles] = useState<DeskCycle[]>([]);
  const [nightReceipts, setNightReceipts] = useState<ActionReceipt[]>([]);
  const [nightBundleHash, setNightBundleHash] = useState<string | null>(null);
  const [killSwitch, setKillSwitch] = useState(false);
  const [remainingMs, setRemainingMs] = useState(0);
  const [anomalies, setAnomalies] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const armTimer = useRef<number | null>(null);
  const planRef = useRef<RebalancePlan | null>(null);
  const bookRef = useRef<BookFile | null>(null);
  const fillsRef = useRef<Fill[]>([]);
  const auditRef = useRef<AuditEvent[]>([]);

  useEffect(() => {
    planRef.current = plan;
  }, [plan]);
  useEffect(() => {
    bookRef.current = book;
  }, [book]);
  useEffect(() => {
    fillsRef.current = fills;
  }, [fills]);
  useEffect(() => {
    auditRef.current = audit;
  }, [audit]);

  const persist = useCallback(async (next: {
    book: BookFile | null;
    fills: Fill[];
    audit: AuditEvent[];
    account: PaperAccount | null;
  }) => {
    try {
      localStorage.setItem(localKey, JSON.stringify(next));
    } catch {
      /* ignore */
    }
    try {
      await fetch("/api/ledger", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          book: next.book,
          fills: next.fills,
          audit: next.audit,
          account: next.account,
          clear: !next.book && next.fills.length === 0 && next.audit.length === 0,
        }),
      });
    } catch {
      /* server ledger is best-effort */
    }
  }, [localKey]);

  useEffect(() => {
    if (opLoading) return;
    let cancelled = false;
    setHydrated(false);
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
          if (!cancelled && !remote.book) {
            setBook(null);
            setAccount(null);
            setFills([]);
            setAudit([]);
            setPhase("empty");
          }
        }
      } catch {
        /* fall through */
      }
      try {
        const raw = localStorage.getItem(localKey);
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
  }, [localKey, opLoading, operator?.id]);

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
        auditRef.current = next;
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
        setNightReceipts([]);
        setNightBundleHash(null);
        setPhase("loaded");
        setError(null);
        setAnomalies([]);
        log("operator", "book.import", `Imported ${name} · ${b.lots.length} lots · cash ${b.cashUsdt.toFixed(0)} USDT.`);
        await persist({ book: b, fills: fillsRef.current, audit: auditRef.current, account: acc });
      } catch (e) {
        setError(e instanceof Error ? e.message : "CSV parse failed.");
      }
    },
    [log, persist],
  );

  const runCycleNow = useCallback(() => {
    if (!book) return;
    setPhase("watching");
    setAnomalies([]);
    setNightReceipts([]);
    setNightBundleHash(null);
    log("system", "cycle.start", "Desk cycle started across research, sentiment, risk, execution.");
    const ts = Date.now();
    const acc = bookToAccount(book, ts);
    window.setTimeout(() => {
      const p = planRebalance(book, ts, killSwitch);
      setCycles(p.cycles);
      setPlan(p);
      setAccount(acc);
      setPhase("proposed");
      for (const c of p.cycles) {
        log("research", "brief", c.research.thesis, c.symbol);
        log("sentiment", "print", `Score ${c.sentiment.score} (${c.sentiment.heat}).`, c.symbol);
        log(
          "risk",
          "gate",
          `Verdict ${c.risk.verdict}. ${c.risk.results.filter((r) => !r.passed).length} rules tripped.`,
          c.symbol,
        );
        log(
          "execution",
          "receipt",
          `${c.receipt.kind.toUpperCase()} ${c.receipt.qty} ${c.symbol} · ${c.receipt.hash}`,
          c.symbol,
        );
      }
      log(
        "execution",
        "proposal",
        `${p.summary} Night proof ${p.bundleHash}. ${p.receipts.length} sized actions.`,
      );
      void persist({ book, fills: fillsRef.current, audit: auditRef.current, account: acc });
    }, 700);
  }, [book, killSwitch, log, persist]);

  const cancel = useCallback(() => {
    if (armTimer.current) window.clearInterval(armTimer.current);
    const p = planRef.current;
    if (p) {
      const sealed = p.receipts.map((r) =>
        r.status === "preview" ? sealReceipt(r, "cancelled", { reason: `${r.reason} Cancelled before fill.` }) : r,
      );
      setNightReceipts(sealed);
      setNightBundleHash(bundleReceipts(sealed));
      setPlan({ ...p, receipts: sealed, bundleHash: bundleReceipts(sealed) });
    }
    setPhase("cancelled");
    setRemainingMs(0);
    log("operator", "cancel", "Operator cancelled the armed order. No fill.");
  }, [log]);

  const finalizeNight = useCallback(
    (args: {
      plan: RebalancePlan;
      book: BookFile;
      sealed: ActionReceipt[];
      newFills: Fill[];
      acc: PaperAccount;
      nextBook: BookFile;
    }) => {
      const bundle = bundleReceipts(args.sealed, Date.now());
      setNightReceipts(args.sealed);
      setNightBundleHash(bundle);
      setPlan({ ...args.plan, receipts: args.sealed, bundleHash: bundle });
      const nextFills = [...args.newFills, ...fillsRef.current];
      setAccount(args.acc);
      setFills(nextFills);
      setBook(args.nextBook);
      setPhase("filled");
      log(
        "system",
        "order.done",
        `Night closed. ${args.newFills.length} fill(s), ${args.sealed.length} receipt(s), proof ${bundle}.`,
      );
      void persist({
        book: args.nextBook,
        fills: nextFills,
        audit: auditRef.current,
        account: args.acc,
      });
    },
    [log, persist],
  );

  const submitPlan = useCallback(() => {
    const p = planRef.current;
    const b = bookRef.current;
    if (!p || !b) return;
    if (killSwitch) {
      setPhase("cancelled");
      setAnomalies(["kill_switch"]);
      log("system", "kill", "Kill switch blocked submission.");
      return;
    }

    // Hold-only night: confirm every sized hold receipt without arming a trade.
    if (p.legs.length === 0) {
      const sealed = p.receipts.map((r) =>
        sealReceipt(r, r.kind === "hold" || r.qty === 0 ? "hold" : r.status, {
          reason: `${r.reason} Confirmed overnight.`,
          ts: Date.now(),
        }),
      );
      const acc = bookToAccount(b);
      finalizeNight({
        plan: p,
        book: b,
        sealed,
        newFills: [],
        acc,
        nextBook: b,
      });
      log("execution", "hold.confirm", `Confirmed ${sealed.length} hold receipt(s). Proof ${bundleReceipts(sealed)}.`);
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
      const currentPlan = planRef.current;
      const currentBook = bookRef.current;
      if (!currentPlan || !currentBook) return;

      const hits: string[] = [];
      for (const leg of currentPlan.legs) {
        const q = quoteAt(leg.symbol, Date.now());
        const cycle = currentPlan.cycles.find((c) => c.symbol === leg.symbol);
        if (!cycle) continue;
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
        const sealed = currentPlan.receipts.map((r) =>
          r.status === "preview"
            ? sealReceipt(r, "cancelled", { reason: `${r.reason} Cancel-on-anomaly: ${uniq.join(", ")}.` })
            : r,
        );
        setNightReceipts(sealed);
        setNightBundleHash(bundleReceipts(sealed));
        setPlan({ ...currentPlan, receipts: sealed, bundleHash: bundleReceipts(sealed) });
        setPhase("cancelled");
        log("execution", "cancel-on-anomaly", `Cancelled: ${uniq.join(", ")}.`);
      } else if (left <= 0) {
        if (armTimer.current) window.clearInterval(armTimer.current);
        let acc = bookToAccount(currentBook);
        const newFills: Fill[] = [];
        const sealedLegs = new Map<string, ActionReceipt>();
        for (const leg of currentPlan.legs) {
          const q = quoteAt(leg.symbol, Date.now());
          const px = leg.side === "sell" ? q.bid : q.ask;
          const sealed = sealReceipt(leg.receipt, "filled", {
            limitPrice: px,
            qty: leg.qty,
            reason: `${leg.reason} Filled.`,
            ts: Date.now(),
          });
          sealedLegs.set(leg.symbol, sealed);
          const fill = makeFill({
            orderId: `ord_${leg.symbol}_${started}`,
            symbol: leg.symbol,
            side: leg.side,
            qty: leg.qty,
            price: px,
            ts: Date.now(),
            receiptHash: sealed.hash,
            receiptId: sealed.id,
          });
          acc = applyFill(acc, fill);
          newFills.push(fill);
          log(
            "execution",
            "fill",
            `${fill.side} ${fill.qty} ${fill.symbol} @ ${fill.price.toFixed(2)} · fee ${fill.feeUsdt.toFixed(2)} USDT · receipt ${sealed.hash}`,
            fill.symbol,
          );
        }
        acc = markAccount(acc, bookQuotes(Date.now()));
        const sealed = currentPlan.receipts.map((r) => {
          const filled = sealedLegs.get(r.symbol);
          if (filled) return filled;
          if (r.kind === "hold" || r.qty === 0) {
            return sealReceipt(r, "hold", { reason: `${r.reason} Confirmed overnight.`, ts: Date.now() });
          }
          return r;
        });
        const lots = currentBook.lots
          .map((lot) => {
            const leg = currentPlan.legs.find((l) => l.symbol === lot.symbol);
            if (!leg) return lot;
            return { ...lot, qty: leg.toQty };
          })
          .filter((l) => l.qty !== 0);
        // Apply buys into book qty via toQty already; cash from account
        const nextBook: BookFile = {
          ...currentBook,
          lots,
          cashUsdt: acc.cashUsdt,
        };
        finalizeNight({
          plan: currentPlan,
          book: currentBook,
          sealed,
          newFills,
          acc,
          nextBook,
        });
      }
    }, 250) as unknown as number;
  }, [finalizeNight, killSwitch, log]);

  const clearDesk = useCallback(async () => {
    if (armTimer.current) window.clearInterval(armTimer.current);
    setPhase("empty");
    setBook(null);
    setAccount(null);
    setPlan(null);
    setCycles([]);
    setNightReceipts([]);
    setNightBundleHash(null);
    setAnomalies([]);
    setRemainingMs(0);
    setError(null);
    setFills([]);
    setAudit([]);
    localStorage.removeItem(localKey);
    await persist({ book: null, fills: [], audit: [], account: null });
  }, [localKey, persist]);

  const value = useMemo<DeskCtx>(
    () => ({
      phase,
      book,
      account,
      plan,
      fills,
      audit,
      cycles,
      nightReceipts,
      nightBundleHash,
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
      nightReceipts,
      nightBundleHash,
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
