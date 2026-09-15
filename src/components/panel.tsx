import { cls } from "@/lib/format";

export function Panel({
  title,
  kicker,
  action,
  children,
  className,
}: {
  title?: string;
  kicker?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={cls("rounded-xl border border-line bg-panel lamp", className)}>
      {(title || action) && (
        <header className="flex items-center justify-between gap-3 border-b border-line px-4 py-3">
          <div>
            {kicker && (
              <div className="text-[10px] uppercase tracking-[0.18em] text-amber">{kicker}</div>
            )}
            {title && <h2 className="text-[13px] font-medium text-ink">{title}</h2>}
          </div>
          {action}
        </header>
      )}
      <div className="p-4">{children}</div>
    </section>
  );
}

export function Metric({
  label,
  value,
  hint,
  tone,
}: {
  label: string;
  value: string;
  hint?: string;
  tone?: "gain" | "loss" | "amber" | "mute";
}) {
  const color =
    tone === "gain"
      ? "text-gain"
      : tone === "loss"
        ? "text-loss"
        : tone === "amber"
          ? "text-amber"
          : "text-ink";
  return (
    <div className="min-w-0">
      <div className="text-[10px] uppercase tracking-[0.16em] text-faint">{label}</div>
      <div className={cls("mt-1 text-[18px] tabular", color)}>{value}</div>
      {hint && <div className="mt-0.5 text-[11px] text-mute">{hint}</div>}
    </div>
  );
}

export function Pill({
  children,
  tone = "mute",
}: {
  children: React.ReactNode;
  tone?: "gain" | "loss" | "amber" | "mute" | "warn" | "blue";
}) {
  const map = {
    gain: "bg-gain/10 text-gain",
    loss: "bg-loss/10 text-loss",
    amber: "bg-amber/10 text-amber",
    warn: "bg-warn/10 text-warn",
    blue: "bg-blue/10 text-blue",
    mute: "bg-panel2 text-mute",
  };
  return (
    <span className={cls("inline-flex rounded-md px-1.5 py-0.5 text-[10px] uppercase tracking-wider", map[tone])}>
      {children}
    </span>
  );
}
