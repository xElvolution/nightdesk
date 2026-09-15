export function LogoMark({ size = 28 }: { size?: number }) {
  return (
    <span
      className="inline-flex items-center justify-center rounded-[9px] border border-accent/30 bg-surface"
      style={{ width: size, height: size }}
    >
      <svg width={size * 0.5} height={size * 0.5} viewBox="0 0 16 16" fill="none" aria-hidden>
        <path d="M8 1.5v3.5" stroke="#4DE8FF" strokeWidth="1.6" />
        <circle cx="8" cy="1.4" r="1.1" fill="#4DE8FF" />
        <rect x="3" y="5" width="10" height="8" rx="1.2" stroke="#4DE8FF" />
      </svg>
    </span>
  );
}
