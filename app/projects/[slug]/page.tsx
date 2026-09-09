import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CaseStudyNav } from "@/components/CaseStudyNav";
import { EdgeSwipeBack } from "@/components/EdgeSwipeBack";
import { PageShell } from "@/components/PageChrome";
import { CountUp } from "@/components/motion";
import { getProject, projects } from "@/content/projects";
import { routeMetadata } from "@/content/seo";
import {
  getProjectBody,
  getProjectSections,
  projectSlugs,
} from "@/lib/project-mdx";

export function generateStaticParams() {
  return projectSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const project = getProject(slug);
  const path = `/projects/${slug}`;
  if (!project) return routeMetadata(path, { title: "Project" });
  return routeMetadata(path, {
    title: project.name,
    description: project.summary,
    openGraph: { type: "article" },
  });
}

export default async function ProjectCaseStudyPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) notFound();
  const [body, sections] = await Promise.all([
    getProjectBody(slug),
    getProjectSections(slug),
  ]);

  // Related: explicit cross-links first (item 7: kernel ↔ compiler ↔
  // processor), then shared-filter projects, deduped, excluding self.
  const sharesFilter = (item: (typeof projects)[number]) =>
    item.filters.some((f) => project.filters.includes(f));
  const explicit = (project.related ?? [])
    .map((slug) => projects.find((p) => p.slug === slug))
    .filter((p): p is (typeof projects)[number] => Boolean(p) && p!.slug !== project.slug);
  const seen = new Set(explicit.map((p) => p.slug));
  const fill = [
    ...projects.filter((p) => p.slug !== project.slug && sharesFilter(p)),
    ...projects.filter((p) => p.slug !== project.slug && !sharesFilter(p)),
  ].filter((p) => !seen.has(p.slug));
  const related = [...explicit, ...fill].slice(0, 3);

  return (
    <PageShell>
      <EdgeSwipeBack>
      <p className="mb-4 font-[family-name:var(--font-jetbrains)] text-xs text-[var(--amber)]">
        <Link href="/projects" className="hover:underline">
          ← Projects
        </Link>
      </p>
      <p className="section-label">Case study</p>
      <h1 className="mb-3 font-[family-name:var(--font-syne)] text-[clamp(1.75rem,3.5vw,2.75rem)] font-bold leading-[1.1] tracking-tight">
        {project.name}
      </h1>
      <div className="mb-8 flex flex-wrap items-center gap-x-5 gap-y-2 font-[family-name:var(--font-jetbrains)] text-sm text-[var(--text-dim)]">
        <span>{project.lang}</span>
        {project.repo ? (
          <a
            href={project.repo}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 text-[var(--amber)] hover:underline"
          >
            Source on GitHub
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-3.5 w-3.5"
              aria-hidden
            >
              <path d="M7 17 17 7" />
              <path d="M9 7h8v8" />
            </svg>
          </a>
        ) : null}
      </div>
      {project.metrics?.length ? (
        <div className="mb-10 grid max-w-3xl grid-cols-3 gap-px overflow-hidden rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--border)]">
          {project.metrics.map((metric) => (
            <div
              key={metric.label}
              className="flex flex-col items-center gap-1 bg-[var(--bg-2)] px-3 py-5 text-center"
            >
              <span className="font-[family-name:var(--font-syne)] text-2xl font-bold text-[var(--amber)]">
                <CountUp value={metric.value} />
              </span>
              <span className="text-[0.72rem] leading-snug text-[var(--text-dim)]">
                {metric.label}
              </span>
            </div>
          ))}
        </div>
      ) : null}
      <CaseStudyNav sections={sections} />
      <div className="max-w-3xl">{body}</div>
      {project.bullets?.length ? (
        <div className="mt-12 max-w-3xl">
          <h2 className="mb-3 font-[family-name:var(--font-syne)] text-xl font-bold">
            From the CV
          </h2>
          <ul className="list-disc space-y-2 pl-5 text-[var(--text-mid)]">
            {project.bullets.map((bullet) => (
              <li key={bullet}>{bullet}</li>
            ))}
          </ul>
        </div>
      ) : null}
      <div className="mt-12 max-w-3xl">
        <h2 className="mb-3 font-[family-name:var(--font-syne)] text-xl font-bold">
          Related projects
        </h2>
        <div className="flex flex-wrap gap-2">
          {related.map((item) => (
            <Link
              key={item.slug}
              href={`/projects/${item.slug}`}
              className="related-chip rounded border border-[var(--border)] px-3 py-1 text-sm text-[var(--text-mid)] hover:border-[var(--amber-dim)] hover:text-[var(--amber)]"
            >
              {item.name}
            </Link>
          ))}
        </div>
      </div>
      </EdgeSwipeBack>
    </PageShell>
  );
}
