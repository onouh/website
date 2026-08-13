import Link from "next/link";
import type { Project } from "@/content/types";

export function ProjectCard({ project }: { project: Project }) {
  return (
    <Link
      href={`/projects/${project.slug}`}
      className="group relative flex flex-col gap-4 overflow-hidden rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--bg-2)] p-7 transition-[border-color,transform] hover:-translate-y-0.5 hover:border-[rgba(240,165,0,0.25)] motion-reduce:transform-none"
    >
      <span
        aria-hidden
        className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-[var(--amber)] to-transparent opacity-0 transition-opacity group-hover:opacity-100"
      />
      <div className="flex items-start justify-between">
        <span className="flex h-10 w-10 items-center justify-center rounded-lg border border-[rgba(240,165,0,0.2)] bg-[var(--amber-glow)] text-lg">
          {project.icon}
        </span>
        <span className="rounded border border-[var(--border)] px-2 py-1 font-[family-name:var(--font-jetbrains)] text-[0.68rem] tracking-wide text-[var(--text-dim)]">
          {project.lang}
        </span>
      </div>
      <h2 className="font-[family-name:var(--font-syne)] text-[1.05rem] font-bold text-[var(--text)]">
        {project.name}
      </h2>
      <p className="flex-1 text-[0.86rem] leading-relaxed text-[var(--text-mid)]">
        {project.summary}
      </p>
      <div className="flex flex-wrap gap-1.5">
        {project.tags.map((tag) => (
          <span
            key={tag}
            className="rounded-[3px] border border-[rgba(107,159,212,0.15)] bg-[var(--bg-3)] px-2 py-0.5 font-[family-name:var(--font-jetbrains)] text-[0.68rem] text-[var(--blue)]"
          >
            {tag}
          </span>
        ))}
      </div>
    </Link>
  );
}
