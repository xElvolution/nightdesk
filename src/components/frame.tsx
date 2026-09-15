export function PageFrame({
  kicker,
  title,
  lede,
  extra,
  children,
}: {
  kicker?: string;
  title: string;
  lede?: string;
  extra?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto max-w-7xl px-5 py-8">
      <header className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div className="max-w-3xl">
          {kicker && (
            <div className="text-[10px] uppercase tracking-[0.2em] text-amber">{kicker}</div>
          )}
          <h1 className="serif mt-1 text-3xl text-ink md:text-4xl">{title}</h1>
          {lede && <p className="mt-2 max-w-2xl text-[14px] leading-6 text-mute">{lede}</p>}
        </div>
        {extra}
      </header>
      {children}
    </div>
  );
}
