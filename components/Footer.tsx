import { IbmWordmark } from "@/components/IbmWordmark";
import { TrackedLink } from "@/components/TrackedLink";
import { profile } from "@/content/profile";

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-auto flex flex-wrap items-center justify-between gap-4 border-t border-[var(--border)] px-[var(--gutter)] py-8">
      <p className="leading-none">
        <IbmWordmark name={profile.name} />
      </p>
      <div className="flex gap-6">
        <TrackedLink
          className="text-sm text-[var(--text-dim)] transition-colors hover:text-[var(--amber)]"
          href={`mailto:${profile.email}`}
          event="email_click"
          properties={{ placement: "footer" }}
        >
          Email
        </TrackedLink>
        {profile.social.map((link) => (
          <TrackedLink
            key={link.href}
            className="text-sm text-[var(--text-dim)] transition-colors hover:text-[var(--amber)]"
            href={link.href}
            target="_blank"
            rel="noreferrer"
            event="social_click"
            properties={{ network: link.label, placement: "footer" }}
          >
            {link.label}
          </TrackedLink>
        ))}
      </div>
      <p className="font-[family-name:var(--font-jetbrains)] text-xs tracking-wide text-[var(--text-dim)]">
        {profile.location} — {year}
      </p>
    </footer>
  );
}
