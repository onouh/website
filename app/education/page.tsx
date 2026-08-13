import type { Metadata } from "next";
import { PageShell, SectionHeader } from "@/components/PageChrome";
import { coursework, education } from "@/content/education";
import { profile } from "@/content/profile";

export const metadata: Metadata = {
  title: "Education",
  description:
    "Dual degree in Computer & Artificial Intelligence Engineering at Ain Shams University and the University of East London.",
};

export default function EducationPage() {
  return (
    <PageShell muted>
      <SectionHeader index="05" label="Education" title="Academic Background" />
      <div className="grid gap-6 md:grid-cols-2">
        {education.map((item) => (
          <article
            key={item.id}
            className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--bg-3)] p-8"
          >
            <p className="mb-2 font-[family-name:var(--font-jetbrains)] text-[0.72rem] tracking-[0.1em] text-[var(--amber)] uppercase">
              {item.degree}
            </p>
            <h2 className="mb-1 font-[family-name:var(--font-syne)] text-xl font-bold leading-snug">
              {item.school}
            </h2>
            {item.schoolDetail ? (
              <p className="mb-2 text-sm font-normal text-[var(--text-mid)]">
                {item.schoolDetail}
              </p>
            ) : null}
            <p className="mb-4 text-sm text-[var(--text-dim)]">{item.year}</p>
            <p className="text-[0.83rem] leading-relaxed text-[var(--text-mid)]">
              {item.detail}
            </p>
            {item.gpa ? (
              <span className="mt-4 inline-block rounded border border-[rgba(47,107,255,0.3)] bg-[var(--amber-glow)] px-3 py-1 font-[family-name:var(--font-jetbrains)] text-[0.72rem] tracking-wide text-[var(--amber)]">
                {item.gpa}
              </span>
            ) : null}
            {item.honors && !item.gpa ? (
              <span className="mt-4 inline-block rounded border border-[rgba(47,107,255,0.3)] bg-[var(--amber-glow)] px-3 py-1 font-[family-name:var(--font-jetbrains)] text-[0.72rem] tracking-wide text-[var(--amber)]">
                {item.honors}
              </span>
            ) : null}
          </article>
        ))}
      </div>
      <div className="mt-10">
        <h2 className="mb-4 font-[family-name:var(--font-syne)] text-lg font-semibold">
          Coursework
        </h2>
        <div className="flex flex-wrap gap-2">
          {coursework.map((course) => (
            <span
              key={course}
              className="rounded border border-[var(--border)] bg-[var(--bg-3)] px-3 py-1 font-[family-name:var(--font-jetbrains)] text-[0.78rem] text-[var(--text-mid)]"
            >
              {course}
            </span>
          ))}
        </div>
        <h2 className="mt-10 mb-4 font-[family-name:var(--font-syne)] text-lg font-semibold">
          Languages
        </h2>
        <div className="flex flex-wrap gap-2">
          {profile.languages.map((language) => (
            <span
              key={language.name}
              className="rounded border border-[var(--border)] bg-[var(--bg-3)] px-3 py-1 font-[family-name:var(--font-jetbrains)] text-[0.78rem] text-[var(--text-mid)]"
            >
              {language.name} — {language.level}
            </span>
          ))}
        </div>
      </div>
    </PageShell>
  );
}
