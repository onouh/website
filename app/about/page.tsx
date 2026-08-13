import type { Metadata } from "next";
import { PageShell, SectionHeader } from "@/components/PageChrome";
import { profile } from "@/content/profile";

export const metadata: Metadata = {
  title: "About",
  description: `About ${profile.name} — ${profile.tagline}`,
};

export default function AboutPage() {
  return (
    <PageShell muted>
      <SectionHeader index="01" label="About" title="Who I Am" />
      <div className="grid gap-12 md:grid-cols-2">
        <div className="space-y-5 text-[var(--text-mid)] leading-[1.8]">
          {profile.summary.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
          <p>{profile.beyond}</p>
          <ul className="mt-8 space-y-2.5">
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
        </div>
        <div>
          <h2 className="mb-4 font-[family-name:var(--font-syne)] text-lg font-semibold">
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
          <div className="mt-8 grid grid-cols-2 gap-4">
            {profile.stats.map((stat) => (
              <div
                key={stat.label}
                className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--bg-3)] p-6"
              >
                <div className="mb-1 font-[family-name:var(--font-syne)] text-3xl font-extrabold text-[var(--amber)]">
                  {stat.value}
                </div>
                <div className="text-[0.8rem] text-[var(--text-dim)]">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </PageShell>
  );
}
