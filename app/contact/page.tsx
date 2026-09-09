import type { Metadata } from "next";
import { ContactForm } from "@/components/ContactForm";
import { PageShell, SectionHeader } from "@/components/PageChrome";
import { Reveal } from "@/components/motion";
import { profile } from "@/content/profile";
import { routeMetadata } from "@/content/seo";

export const metadata: Metadata = routeMetadata("/contact", {
  title: "Contact",
  description: `Get in touch with ${profile.name} — email, LinkedIn, and GitHub.`,
});

export default function ContactPage() {
  return (
    <PageShell muted>
      <SectionHeader index="06" label="Contact" title="Get in touch" />
      <div className="grid gap-12 md:grid-cols-2">
        <Reveal>
          <p className="mb-6 text-[var(--text-mid)]">
            Send a note through the form. If email sending is not configured on this
            deployment, your message is validated and you can fall back to mailto.
          </p>
          <ul className="space-y-3">
            <li>
              <a
                className="font-[family-name:var(--font-jetbrains)] text-sm text-[var(--text-mid)] hover:text-[var(--amber)]"
                href={`mailto:${profile.email}`}
              >
                {profile.email}
              </a>
            </li>
            {profile.phones.map((phone) => (
              <li key={phone.tel}>
                <a
                  className="font-[family-name:var(--font-jetbrains)] text-sm text-[var(--text-mid)] hover:text-[var(--amber)]"
                  href={`tel:${phone.tel}`}
                >
                  {phone.display}
                </a>
              </li>
            ))}
            {profile.social.map((link) => (
              <li key={link.href}>
                <a
                  className="font-[family-name:var(--font-jetbrains)] text-sm text-[var(--text-mid)] hover:text-[var(--amber)]"
                  href={link.href}
                  target="_blank"
                  rel="noreferrer"
                >
                  {link.short ?? link.label}
                </a>
              </li>
            ))}
          </ul>
        </Reveal>
        <Reveal delay={0.1}>
          <ContactForm />
        </Reveal>
      </div>
    </PageShell>
  );
}
