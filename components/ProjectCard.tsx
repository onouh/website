import Image from "next/image";
import Link from "next/link";
import { ProjectIcon } from "@/components/ProjectIcon";
import type { Project } from "@/content/types";

/** Deterministic gradient for cards without a thumbnail: stable per slug,
 * always within the site's dark brand neighborhood (amber/blue leads into
 * navy depth), so the grid reads varied but on-brand. */
const GRADIENTS = [
  "linear-gradient(135deg, hsl(38 65% 13%) 0%, hsl(220 55% 8%) 100%)",
  "linear-gradient(135deg, hsl(222 60% 13%) 0%, hsl(195 50% 8%) 100%)",
  "linear-gradient(135deg, hsl(215 55% 14%) 0%, hsl(260 45% 9%) 100%)",
  "linear-gradient(135deg, hsl(30 55% 12%) 0%, hsl(230 60% 9%) 100%)",
];

function fallbackGradient(slug: string) {
  let h = 0;
  for (const ch of slug) h = (h * 31 + ch.charCodeAt(0)) | 0;
  return GRADIENTS[Math.abs(h) % GRADIENTS.length];
}

export function ProjectCard({
  project,
  tabIndex,
}: {
  project: Project;
  tabIndex?: number;
}) {
  return (
    <Link
      href={`/projects/${project.slug}`}
      tabIndex={tabIndex}
      className="group relative flex flex-col gap-4 overflow-hidden rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--bg-2)] p-7 transition-[border-color,transform] hover:-translate-y-0.5 hover:border-[rgba(47,107,255,0.25)] active:translate-y-0 active:scale-[0.99] motion-reduce:transform-none"
    >
      <span
        aria-hidden
        className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-[var(--amber)] to-transparent opacity-0 transition-opacity group-hover:opacity-100"
      />
      {/* Media banner: full-bleed via negative card padding; corners are
          clipped by the card's overflow-hidden. With a thumbnail, next/image
          fills a fixed 16:9 box (zero CLS) and zooms slowly on hover. No
          thumbnail: deterministic brand gradient + icon watermark. */}
      <div
        aria-hidden
        className="relative -mx-7 -mt-7 mb-5 aspect-[16/9] overflow-hidden border-b border-[var(--border)]"
        style={project.thumbnail ? undefined : { background: fallbackGradient(project.slug) }}
      >
        {project.thumbnail ? (
          <Image
            src={project.thumbnail}
            alt=""
            fill
            sizes="(min-width: 768px) 50vw, 100vw"
            className="object-cover transition-transform duration-500 ease-out group-hover:scale-105 motion-reduce:transition-none motion-reduce:group-hover:scale-100"
          />
        ) : (
          <span className="absolute inset-0 flex items-center justify-center">
            <ProjectIcon
              id={project.icon}
              className="h-16 w-16 opacity-[0.16] transition-opacity duration-500 group-hover:opacity-[0.28] motion-reduce:transition-none"
            />
          </span>
        )}
      </div>
      <div className="flex items-start justify-between">
        <span className="flex h-10 w-10 items-center justify-center rounded-lg border border-[rgba(47,107,255,0.2)] bg-[var(--amber-glow)] text-[var(--quantum)]">
          <ProjectIcon id={project.icon} />
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
      {project.repo ? (
        <span
          aria-hidden
          className="inline-flex items-center gap-1.5 font-[family-name:var(--font-jetbrains)] text-[0.72rem] text-[var(--text-dim)] transition-colors group-hover:text-[var(--amber)]"
        >
          GitHub
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-3 w-3"
          >
            <path d="M7 17 17 7" />
            <path d="M9 7h8v8" />
          </svg>
        </span>
      ) : null}
    </Link>
  );
}
