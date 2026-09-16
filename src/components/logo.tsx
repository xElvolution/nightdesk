export function LogoMark({ size = 28 }: { size?: number }) {
  return (
    <span
      className="inline-flex items-center justify-center rounded-[9px] border border-sky-300/25 bg-surface"
      style={{ width: size, height: size }}
      aria-hidden
    >
      <svg
        width={size * 0.58}
        height={size * 0.58}
        viewBox="0 0 16 16"
        fill="none"
      >
        {/* Crescent moon */}
        <path
          d="M10.2 2.2a5.6 5.6 0 1 0 3.4 10.2 4.4 4.4 0 1 1-3.4-10.2z"
          fill="#B8D0F0"
        />
        {/* Desk shelf */}
        <path
          d="M3 13.2h10"
          stroke="#4DE8FF"
          strokeWidth="1.2"
          strokeLinecap="round"
          opacity="0.7"
        />
      </svg>
    </span>
  );
}
