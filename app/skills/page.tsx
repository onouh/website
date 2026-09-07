import type { Metadata } from "next";
import { PageShell, SectionHeader } from "@/components/PageChrome";
import { RevealGroup, RevealItem } from "@/components/motion";
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
      <RevealGroup className="grid gap-6 md:grid-cols-2 lg:grid-cols-3" step={0.09}>
        {skillGroups.map((group) => (
          <RevealItem key={group.title}>
            <SkillGroup group={group} />
          </RevealItem>
        ))}
      </RevealGroup>
    </PageShell>
  );
}
