export function SectionHeader({
  index,
  label,
  title,
}: {
  index: string;
  label: string;
  title: string;
}) {
  return (
    <div className="mb-10">
      <div className="section-label">
        {index} — {label}
      </div>
      <h1 className="font-[family-name:var(--font-syne)] text-[clamp(1.75rem,3.5vw,2.5rem)] font-bold tracking-tight text-[var(--text)]">
        {title}
      </h1>
    </div>
  );
}

export function PageShell({
  children,
  muted,
}: {
  children: React.ReactNode;
  muted?: boolean;
}) {
  return (
    <section
      className={`px-6 py-24 md:px-12 md:py-28 ${muted ? "bg-[var(--bg-2)]" : ""}`}
    >
      <div className="mx-auto max-w-[1000px]">{children}</div>
    </section>
  );
}
