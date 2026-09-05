"use client";

import Link from "next/link";
import { projectFilters } from "@/content/projects";
import type { ProjectFilterId } from "@/content/types";

export function ProjectFilters({
  active,
}: {
  active: ProjectFilterId | "all";
}) {
  const items: { id: ProjectFilterId | "all"; label: string }[] = [
    { id: "all", label: "All" },
    ...projectFilters,
  ];

  return (
    <div className="mb-8 flex flex-wrap gap-2" role="group" aria-label="Filter projects">
      {items.map((item) => {
        const href = item.id === "all" ? "/projects" : `/projects?filter=${item.id}`;
        const selected = active === item.id;
        return (
          <Link
            key={item.id}
            href={href}
            scroll={false}
            className={`filter-chip rounded-[var(--radius)] border px-3 py-1.5 font-[family-name:var(--font-jetbrains)] text-xs uppercase tracking-wide transition-[border-color,background-color,color,transform] duration-150 active:scale-95 ${
              selected
                ? "border-[var(--amber-dim)] bg-[var(--amber-glow)] text-[var(--amber)]"
                : "border-[var(--border)] text-[var(--text-mid)] hover:border-[var(--amber-dim)] hover:text-[var(--text)]"
            }`}
            aria-current={selected ? "true" : undefined}
          >
            {item.label}
          </Link>
        );
      })}
    </div>
  );
}
