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
    <div className="px-5 py-6 lg:px-6">
      <header className="mb-5 flex flex-wrap items-end justify-between gap-4">
        <div className="max-w-3xl">
          {kicker && <div className="label text-accent">{kicker}</div>}
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-ink md:text-[28px]">
            {title}
          </h1>
          {lede && <p className="mt-2 max-w-2xl text-[13px] leading-6 text-mute">{lede}</p>}
        </div>
        {extra}
      </header>
      {children}
    </div>
  );
}
