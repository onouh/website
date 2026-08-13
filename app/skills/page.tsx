import type { Metadata } from "next";
import { PageShell, SectionHeader } from "@/components/PageChrome";
import { SkillGroup } from "@/components/SkillGroup";
import { skillGroups } from "@/content/skills";

export const metadata: Metadata = {
  title: "Skills",
  description:
    "Languages, systems and architecture, and tools — C/C++, Python, VHDL, OS kernels, FPGA, and PyTorch.",
};

export default function SkillsPage() {
  return (
    <PageShell>
      <SectionHeader index="02" label="Technical Skills" title="What I Build With" />
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {skillGroups.map((group) => (
          <SkillGroup key={group.title} group={group} />
        ))}
      </div>
    </PageShell>
  );
}
