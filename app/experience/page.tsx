import type { Metadata } from "next";
import { PageShell, SectionHeader } from "@/components/PageChrome";
import { Timeline } from "@/components/Timeline";
import { TimelineStory } from "@/components/TimelineStory";
import { experienceChronological } from "@/content/experience";
import { routeMetadata } from "@/content/seo";

export const metadata: Metadata = routeMetadata("/experience", {
  title: "Experience",
  description: "Internships and training — artificial intelligence, enterprise security, process engineering, cloud infrastructure, and marketing.",
});

export default async function ExperiencePage({
  searchParams,
}: {
  searchParams: Promise<{ story?: string }>;
}) {
  const params = await searchParams;
  // Presence check (not truthiness): the bare flag `?story` parses to `""`,
  // which must still enable story mode.
  const storyMode = params.story !== undefined;
  const items = experienceChronological();
  return (
    <PageShell muted>
      {storyMode ? (
        <TimelineStory items={items} />
      ) : (
        <>
          <SectionHeader index="03" label="Experience" title="Where I've Worked" />
          <Timeline items={items} />
        </>
      )}
    </PageShell>
  );
}
