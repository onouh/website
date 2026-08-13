import type { Metadata } from "next";
import { PageShell, SectionHeader } from "@/components/PageChrome";
import { ProjectCard } from "@/components/ProjectCard";
import { ProjectFilters } from "@/components/ProjectFilters";
import { filterProjects } from "@/content/projects";
import type { ProjectFilterId } from "@/content/types";

export const metadata: Metadata = {
  title: "Projects",
  description:
    "Filterable engineering work: OS kernels, compilers, FPGA processors, ML pipelines, and software systems.",
};

const filters = new Set<ProjectFilterId>([
  "os",
  "compilers",
  "fpga",
  "ml",
  "software",
]);

export default async function ProjectsPage({
  searchParams,
}: {
  searchParams: Promise<{ filter?: string }>;
}) {
  const params = await searchParams;
  const raw = params.filter;
  const active: ProjectFilterId | "all" =
    raw && filters.has(raw as ProjectFilterId) ? (raw as ProjectFilterId) : "all";
  const list = filterProjects(active);

  return (
    <PageShell>
      <SectionHeader index="04" label="Projects" title="What I've Built" />
      <ProjectFilters active={active} />
      {list.length === 0 ? (
        <p className="text-[var(--text-mid)]">No projects in this category yet.</p>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {list.map((project) => (
            <ProjectCard key={project.slug} project={project} />
          ))}
        </div>
      )}
    </PageShell>
  );
}
