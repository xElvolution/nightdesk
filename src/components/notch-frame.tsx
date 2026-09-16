/** Thin red notched/chamfered frame used on marketing cards. */
export function NotchFrame({
  children,
  className = "",
  pad = true,
}: {
  children: React.ReactNode;
  className?: string;
  pad?: boolean;
}) {
  return (
    <div className={`mkt-notch ${className}`}>
      <div className={`mkt-notch-inner ${pad ? "p-5 md:p-7" : ""}`}>{children}</div>
    </div>
  );
}
