import type { Metadata } from "next";
import Link from "next/link";
import { PageShell, SectionHeader } from "@/components/PageChrome";
import { CountUp, Reveal, RevealGroup, RevealItem } from "@/components/motion";
import { arc, beyondCode, beyondCodeIntro, ladder, ladderIntro, lookingFor } from "@/content/about";
import { profile } from "@/content/profile";
import { routeMetadata } from "@/content/seo";

export const metadata: Metadata = routeMetadata("/about", {
  title: "About",
  description: `About ${profile.name} — systems and AI engineering: OS kernels, compilers, and processors beside ML pipelines.`,
});

export default function AboutPage() {
  return (
    <PageShell muted>
      <SectionHeader
        index="01"
        label="About"
        title="Both Sides of the Abstraction Line"
      />

      {/* The arc — three paragraphs a stranger can retell after 60 seconds. */}
      <Reveal className="max-w-3xl space-y-5 text-[var(--text-mid)] leading-[1.8]">
        {arc.map((paragraph) => (
          <p key={paragraph.slice(0, 40)}>{paragraph}</p>
        ))}
      </Reveal>

      {/* The proof ladder — every layer of the stack, with the project that proves it. */}
      <section className="mt-16">
        <Reveal className="mb-2">
          <h2 className="font-[family-name:var(--font-syne)] text-xl font-bold text-[var(--text)]">
            The proof, layer by layer
          </h2>
        </Reveal>
        <Reveal className="mb-8 text-[var(--text-mid)]">{ladderIntro}</Reveal>
        <RevealGroup
          as="ol"
          step={0.1}
          className="m-0 list-none space-y-4 p-0"
        >
          {ladder.map((step, i) => (
            <RevealItem
              as="li"
              key={step.layer}
              className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--bg-3)] p-5"
            >
              <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
                <span className="font-[family-name:var(--font-jetbrains)] text-xs text-[var(--text-dim)]">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="font-[family-name:var(--font-jetbrains)] text-xs tracking-wide text-[var(--amber)]">
                  {step.layer}
                </span>
                <h3 className="font-[family-name:var(--font-syne)] text-base font-semibold text-[var(--text)]">
                  {step.project}
                </h3>
              </div>
              <p className="mt-2 pl-0 text-sm leading-relaxed text-[var(--text-mid)] md:pl-[3.4rem]">
                {step.proof}
              </p>
            </RevealItem>
          ))}
        </RevealGroup>
      </section>

      {/* Beyond code — same standard of evidence, not a hobby list. */}
      <section className="mt-16">
        <Reveal className="mb-2">
          <h2 className="font-[family-name:var(--font-syne)] text-xl font-bold text-[var(--text)]">
            Beyond code, by the same standard
          </h2>
        </Reveal>
        <Reveal className="mb-8 text-[var(--text-mid)]">{beyondCodeIntro}</Reveal>
        <RevealGroup
          as="ul"
          step={0.1}
          className="m-0 grid list-none gap-4 p-0 md:grid-cols-3"
        >
          {beyondCode.map((item) => (
            <RevealItem
              as="li"
              key={item.activity}
              className="m-0 list-none rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--bg-3)] p-5"
            >
              <h3 className="font-[family-name:var(--font-syne)] text-base font-semibold text-[var(--text)]">
                {item.activity}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-[var(--text-mid)]">
                {item.evidence}
              </p>
            </RevealItem>
          ))}
        </RevealGroup>
      </section>

      {/* What I'm looking for — the explicit ask, ending in the next click. */}
      <section className="mt-16">
        <Reveal className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--bg-3)] p-6 md:p-8">
          <h2 className="mb-3 font-[family-name:var(--font-syne)] text-xl font-bold text-[var(--amber)]">
            {lookingFor.lead}
          </h2>
          <p className="max-w-2xl text-[var(--text-mid)] leading-[1.8]">
            {lookingFor.body}
          </p>
          <ul className="mt-4 max-w-2xl list-disc space-y-2 pl-5 text-sm leading-relaxed text-[var(--text-mid)] marker:text-[var(--amber)]">
            {lookingFor.points.map((point) => (
              <li key={point.slice(0, 40)}>{point}</li>
            ))}
          </ul>
          <Link
            href="/contact"
            className="mt-6 inline-flex items-center gap-2 font-[family-name:var(--font-jetbrains)] text-sm text-[var(--amber)] hover:underline"
          >
            If that sounds like your team — get in touch
            <span aria-hidden>→</span>
          </Link>
        </Reveal>
      </section>

      {/* Facts strip — stats, languages, and the direct channels. */}
      <section className="mt-16 grid gap-10 md:grid-cols-2">
        <Reveal>
          <h2 className="mb-4 font-[family-name:var(--font-syne)] text-lg font-semibold text-[var(--text)]">
            By the numbers
          </h2>
          <div className="grid grid-cols-2 gap-4">
            {profile.stats.map((stat) => (
              <div
                key={stat.label}
                className="stat-card rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--bg-3)] p-6"
              >
                <div className="mb-1 font-[family-name:var(--font-syne)] text-3xl font-bold tracking-tight text-[var(--amber)]">
                  <CountUp value={stat.value} />
                </div>
                <div className="text-[0.8rem] text-[var(--text-dim)]">{stat.label}</div>
              </div>
            ))}
          </div>
          <h2 className="mb-4 mt-8 font-[family-name:var(--font-syne)] text-lg font-semibold text-[var(--text)]">
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
        </Reveal>
        <Reveal delay={0.1}>
          <h2 className="mb-4 font-[family-name:var(--font-syne)] text-lg font-semibold text-[var(--text)]">
            Direct channels
          </h2>
          <ul className="space-y-2.5">
            <li>
              <a
                className="inline-flex items-center gap-3 font-[family-name:var(--font-jetbrains)] text-sm text-[var(--text-mid)] hover:text-[var(--amber)]"
                href={`mailto:${profile.email}`}
              >
                <span className="h-1.5 w-1.5 rounded-full bg-[var(--amber)]" />
                {profile.email}
              </a>
            </li>
            {profile.phones.map((phone) => (
              <li key={phone.tel}>
                <a
                  className="inline-flex items-center gap-3 font-[family-name:var(--font-jetbrains)] text-sm text-[var(--text-mid)] hover:text-[var(--amber)]"
                  href={`tel:${phone.tel}`}
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-[var(--amber)]" />
                  {phone.display}
                </a>
              </li>
            ))}
            {profile.social.map((link) => (
              <li key={link.href}>
                <a
                  className="inline-flex items-center gap-3 font-[family-name:var(--font-jetbrains)] text-sm text-[var(--text-mid)] hover:text-[var(--amber)]"
                  href={link.href}
                  target="_blank"
                  rel="noreferrer"
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-[var(--amber)]" />
                  {link.short ?? link.label}
                </a>
              </li>
            ))}
          </ul>
        </Reveal>
      </section>
    </PageShell>
  );
}
