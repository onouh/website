import type { SkillGroup as SkillGroupType } from "@/content/types";

export function SkillGroup({ group }: { group: SkillGroupType }) {
  return (
    <div className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--bg-2)] p-7 transition-[border-color,transform] hover:-translate-y-0.5 hover:border-[rgba(240,165,0,0.3)] motion-reduce:transform-none">
      <h2 className="mb-5 border-b border-[var(--border)] pb-3.5 font-[family-name:var(--font-jetbrains)] text-[0.72rem] uppercase tracking-[0.12em] text-[var(--amber)]">
        {group.title}
      </h2>
      <div className="flex flex-wrap gap-2">
        {group.items.map((item) => (
          <span
            key={item}
            className="rounded border border-[var(--border)] bg-[var(--bg-3)] px-3 py-1 font-[family-name:var(--font-jetbrains)] text-[0.78rem] text-[var(--text-mid)]"
          >
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}
