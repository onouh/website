import type { Metadata } from "next";
import { PageShell, SectionHeader } from "@/components/PageChrome";
import { Timeline } from "@/components/Timeline";
import { experienceChronological } from "@/content/experience";

export const metadata: Metadata = {
  title: "Experience",
  description: "Internships and training — artificial intelligence, enterprise security, process engineering, cloud infrastructure, and marketing.",
};

export default function ExperiencePage() {
  return (
    <PageShell muted>
      <SectionHeader index="03" label="Experience" title="Where I've Worked" />
      <Timeline items={experienceChronological()} />
    </PageShell>
  );
}
