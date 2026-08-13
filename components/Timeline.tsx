import type { ExperienceItem } from "@/content/types";

export function Timeline({ items }: { items: ExperienceItem[] }) {
  return (
    <ol className="relative m-0 list-none p-0 before:absolute before:top-2 before:bottom-0 before:left-0 before:w-px before:bg-[var(--border-2)]">
      {items.map((item) => (
        <li key={`${item.company}-${item.date}`} className="relative mb-12 pl-10 last:mb-0">
          <span
            aria-hidden
            className="absolute top-2 left-[-5px] h-[11px] w-[11px] rounded-full border-2 border-[var(--bg-2)] bg-[var(--amber)] shadow-[0_0_0_3px_rgba(240,165,0,0.15)]"
          />
          <div className="mb-1 flex flex-wrap items-baseline justify-between gap-2">
            <span className="font-[family-name:var(--font-jetbrains)] text-xs tracking-wide text-[var(--amber)]">
              {item.company}
            </span>
            <span className="font-[family-name:var(--font-jetbrains)] text-xs text-[var(--text-dim)]">
              {item.date}
            </span>
          </div>
          <h2 className="mb-3 font-[family-name:var(--font-syne)] text-lg font-semibold text-[var(--text)]">
            {item.role}
          </h2>
          <ul className="m-0 list-disc space-y-2 pl-5 text-[0.9rem] leading-relaxed text-[var(--text-mid)]">
            {item.bullets.map((bullet) => (
              <li key={bullet}>{bullet}</li>
            ))}
          </ul>
        </li>
      ))}
    </ol>
  );
}
