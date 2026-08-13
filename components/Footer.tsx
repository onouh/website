import { profile } from "@/content/profile";

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-auto flex flex-wrap items-center justify-between gap-4 border-t border-[var(--border)] px-6 py-8 md:px-12">
      <p className="font-[family-name:var(--font-syne)] text-base font-bold text-[var(--text)]">
        {profile.name}
      </p>
      <div className="flex gap-6">
        <a
          className="text-sm text-[var(--text-dim)] transition-colors hover:text-[var(--amber)]"
          href={`mailto:${profile.email}`}
        >
          Email
        </a>
        {profile.social.map((link) => (
          <a
            key={link.href}
            className="text-sm text-[var(--text-dim)] transition-colors hover:text-[var(--amber)]"
            href={link.href}
            target="_blank"
            rel="noreferrer"
          >
            {link.label}
          </a>
        ))}
      </div>
      <p className="font-[family-name:var(--font-jetbrains)] text-xs tracking-wide text-[var(--text-dim)]">
        {profile.location} — {year}
      </p>
    </footer>
  );
}
