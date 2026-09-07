import type { Metadata } from "next";
import { PageShell, SectionHeader } from "@/components/PageChrome";
import { Reveal } from "@/components/motion";
import { ProjectGallery } from "@/components/ProjectGallery";
import type { ProjectFilterId } from "@/content/types";

export const metadata: Metadata = {
  title: "Projects",
  description:
    "Filterable engineering work: distributed inference engines, fraud-detection platforms, production SaaS, OS kernels, compilers, FPGA processors, and ML pipelines.",
};

const filters = new Set<ProjectFilterId>([
  "os",
  "compilers",
  "fpga",
  "systems",
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

  return (
    <PageShell>
      <SectionHeader index="04" label="Projects" title="What I've Built" />
      <Reveal>
        <ProjectGallery initialFilter={active} />
      </Reveal>
    </PageShell>
  );
}
