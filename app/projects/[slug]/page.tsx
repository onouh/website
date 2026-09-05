import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { EdgeSwipeBack } from "@/components/EdgeSwipeBack";
import { PageShell } from "@/components/PageChrome";
import { getProject, projects } from "@/content/projects";
import { getProjectBody, projectSlugs } from "@/lib/project-mdx";

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
  if (!project) return { title: "Project" };
  return {
    title: project.name,
    description: project.summary,
  };
}

export default async function ProjectCaseStudyPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) notFound();
  const body = await getProjectBody(slug);

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
      <div className="mt-10 flex flex-wrap gap-2">
        {projects
          .filter((item) => item.slug !== project.slug)
          .slice(0, 3)
          .map((item) => (
            <Link
              key={item.slug}
              href={`/projects/${item.slug}`}
              className="related-chip rounded border border-[var(--border)] px-3 py-1 text-sm text-[var(--text-mid)] hover:border-[var(--amber-dim)] hover:text-[var(--amber)]"
            >
              {item.name}
            </Link>
          ))}
      </div>
      </EdgeSwipeBack>
    </PageShell>
  );
}
