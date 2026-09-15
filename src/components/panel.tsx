import { cls } from "@/lib/format";

export function Panel({
  title,
  kicker,
  action,
  children,
  className,
  glow = false,
}: {
  title?: string;
  kicker?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  glow?: boolean;
}) {
  return (
    <section
      className={cls(
        "rounded-[14px] border border-line bg-surface",
        glow && "card-glow",
        className,
      )}
    >
      {(title || action) && (
        <header className="flex items-center justify-between gap-3 border-b border-line px-4 py-3">
          <div>
            {kicker && <div className="label text-accent">{kicker}</div>}
            {title && <h2 className="text-[13px] font-medium tracking-tight text-ink">{title}</h2>}
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
  tone?: "gain" | "loss" | "accent" | "amber" | "mute";
}) {
  const t = tone === "amber" ? "accent" : tone;
  const color =
    t === "gain"
      ? "text-gain"
      : t === "loss"
        ? "text-loss"
        : t === "accent"
          ? "text-accent"
          : "text-ink";
  return (
    <div className="min-w-0">
      <div className="label">{label}</div>
      <div className={cls("mt-1.5 text-[20px] font-medium tracking-tight tabular", color)}>
        {value}
      </div>
      {hint && <div className="mt-1 text-[11px] leading-4 text-mute">{hint}</div>}
    </div>
  );
}

export function Pill({
  children,
  tone = "mute",
}: {
  children: React.ReactNode;
  tone?: "gain" | "loss" | "accent" | "amber" | "mute" | "warn" | "blue";
}) {
  const t = tone === "amber" ? "accent" : tone;
  const map = {
    gain: "bg-gain/10 text-gain",
    loss: "bg-loss/10 text-loss",
    accent: "bg-accent/10 text-accent",
    warn: "bg-warn/10 text-warn",
    blue: "bg-blue/10 text-blue",
    mute: "bg-surface2 text-mute",
  };
  return (
    <span
      className={cls(
        "inline-flex rounded-md px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-[0.12em]",
        map[t],
      )}
    >
      {children}
    </span>
  );
}
