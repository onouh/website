import type { Metadata } from "next";
import { PageShell, SectionHeader } from "@/components/PageChrome";
import { Timeline } from "@/components/Timeline";
import { experienceChronological } from "@/content/experience";

export const metadata: Metadata = {
  title: "Experience",
  description: "Internships and training — enterprise security, process engineering, and cloud infrastructure.",
};

export default function ExperiencePage() {
  return (
    <PageShell muted>
      <SectionHeader index="03" label="Experience" title="Where I've Worked" />
      <Timeline items={experienceChronological()} />
    </PageShell>
  );
}
