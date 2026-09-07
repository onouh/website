import type { Metadata } from "next";
import { PageShell, SectionHeader } from "@/components/PageChrome";
import { Reveal } from "@/components/motion";
import { education } from "@/content/education";
import { experienceChronological } from "@/content/experience";
import { profile } from "@/content/profile";
import { projects } from "@/content/projects";
import { skillGroups } from "@/content/skills";

export const metadata: Metadata = {
  title: "Resume",
  description: `Readable CV for ${profile.name}, Computer & AI Engineering.`,
};

export default function ResumePage() {
  return (
    <PageShell>
      <SectionHeader index="CV" label="Resume" title={profile.name} />
      <Reveal className="mb-10 flex flex-wrap items-center justify-between gap-4">
        <p className="max-w-2xl text-[var(--text-mid)]">{profile.summary[0]}</p>
        <a href="/omar-nouh-resume.pdf" className="btn btn-primary" download>
          Download PDF
        </a>
      </Reveal>

      <section className="mb-12">
        <h2 className="mb-4 font-[family-name:var(--font-syne)] text-xl font-bold">
          Education
        </h2>
        <ul className="space-y-4">
          {education.map((item) => (
            <li key={item.id}>
              <p className="font-medium text-[var(--text)]">
                {item.school}
                {item.schoolDetail ? ` · ${item.schoolDetail}` : ""}
              </p>
              <p className="text-sm text-[var(--text-mid)]">
                {item.degree} · {item.year}
                {item.gpa ? ` · ${item.gpa}` : ""}
                {item.honors ? ` · ${item.honors}` : ""}
              </p>
            </li>
          ))}
        </ul>
      </section>

      <section className="mb-12">
        <h2 className="mb-4 font-[family-name:var(--font-syne)] text-xl font-bold">
          Technical skills
        </h2>
        {skillGroups.map((group) => (
          <p key={group.title} className="mb-2 text-sm text-[var(--text-mid)]">
            <span className="text-[var(--amber)]">{group.title}:</span>{" "}
            {group.items.join(", ")}
          </p>
        ))}
      </section>

      <section className="mb-12">
        <h2 className="mb-4 font-[family-name:var(--font-syne)] text-xl font-bold">
          Professional experience
        </h2>
        <ul className="space-y-8">
          {experienceChronological().map((item) => (
            <li key={`${item.company}-${item.date}`}>
              <p className="font-medium">
                {item.company} · {item.role} · {item.date}
              </p>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-[var(--text-mid)]">
                {item.bullets.map((bullet) => (
                  <li key={bullet}>{bullet}</li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      </section>

      <section className="mb-12">
        <h2 className="mb-4 font-[family-name:var(--font-syne)] text-xl font-bold">
          Selected engineering projects
        </h2>
        <ul className="space-y-6">
          {projects.map((project) => (
            <li key={project.slug}>
              <p className="font-medium">
                {project.name} · {project.lang}
              </p>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-[var(--text-mid)]">
                {(project.bullets ?? [project.summary]).map((bullet) => (
                  <li key={bullet}>{bullet}</li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h2 className="mb-2 font-[family-name:var(--font-syne)] text-xl font-bold">
          Leadership & activities
        </h2>
        <p className="mb-4 text-sm text-[var(--text-mid)]">{profile.beyond}</p>
        <h2 className="mb-2 font-[family-name:var(--font-syne)] text-xl font-bold">
          Languages
        </h2>
        <p className="text-sm text-[var(--text-mid)]">
          {profile.languages.map((l) => `${l.name} (${l.level})`).join(" · ")}
        </p>
        <p className="mt-6 font-[family-name:var(--font-jetbrains)] text-xs text-[var(--text-dim)]">
          {profile.email} · {profile.phones.map((p) => p.display).join(" · ")} ·{" "}
          {profile.location}
        </p>
      </section>
    </PageShell>
  );
}
