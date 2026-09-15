export function Spark({
  points,
  className = "h-16 w-full",
}: {
  points: number[];
  className?: string;
}) {
  if (points.length < 2) return null;
  const min = Math.min(...points);
  const max = Math.max(...points);
  const span = max - min || 1;
  const d = points
    .map((p, i) => {
      const x = (i / (points.length - 1)) * 100;
      const y = 24 - ((p - min) / span) * 22;
      return `${i === 0 ? "M" : "L"}${x.toFixed(2)} ${y.toFixed(2)}`;
    })
    .join(" ");
  const up = points[points.length - 1] >= points[0];
  return (
    <svg viewBox="0 0 100 24" className={className} preserveAspectRatio="none" aria-hidden>
      <path d={d} fill="none" stroke={up ? "#22C55E" : "#F43F5E"} strokeWidth="1.4" />
    </svg>
  );
}

export function EquityChart({
  curve,
}: {
  curve: { t: string; equity: number }[];
}) {
  if (curve.length < 2) return null;
  const vals = curve.map((c) => c.equity);
  const min = Math.min(...vals);
  const max = Math.max(...vals);
  const span = max - min || 1;
  const w = 640;
  const h = 180;
  const path = curve
    .map((c, i) => {
      const x = (i / (curve.length - 1)) * w;
      const y = h - 12 - ((c.equity - min) / span) * (h - 24);
      return `${i === 0 ? "M" : "L"}${x.toFixed(1)} ${y.toFixed(1)}`;
    })
    .join(" ");
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="h-48 w-full" role="img" aria-label="Equity curve">
      <path d={path} fill="none" stroke="#4DE8FF" strokeWidth="1.8" />
    </svg>
  );
}
