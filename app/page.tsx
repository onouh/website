import Link from "next/link";
import { FeaturedCarousel } from "@/components/FeaturedCarousel";
import { featuredProjects } from "@/content/projects";
import { profile } from "@/content/profile";

export default function HomePage() {
  const featured = featuredProjects();

  return (
    <>
      <section className="relative flex min-h-[calc(100vh-72px)] flex-col justify-center overflow-hidden px-[var(--gutter)] py-[var(--space-hero)]">
        <div className="hero-grid-bg" aria-hidden />
        <div
          aria-hidden
          className="pointer-events-none absolute top-[20%] left-[60%] h-[500px] w-[500px] rounded-full bg-[radial-gradient(circle,rgba(47,107,255,0.07)_0%,transparent_70%)]"
        />
        <div className="relative mx-auto w-full max-w-[860px]">
          <p className="animate-fade-up mb-7 inline-flex items-center gap-2 font-[family-name:var(--font-jetbrains)] text-[0.78rem] tracking-[0.1em] text-[var(--amber)] [animation-delay:0.1s] [animation-fill-mode:both] opacity-0">
            <span aria-hidden className="inline-block h-px w-6 bg-[var(--amber)]" />
            {profile.title} · {profile.location}
          </p>
          <h1 className="animate-fade-up mb-4 font-[family-name:var(--font-syne)] text-[clamp(3rem,7vw,5.5rem)] leading-none font-bold tracking-[-0.045em] [animation-delay:0.2s] [animation-fill-mode:both] opacity-0">
            {profile.firstName}
            <br />
            {profile.lastName}
            <span className="text-[var(--amber)]">.</span>
          </h1>
          <p className="animate-fade-up mb-10 max-w-[560px] text-[1.15rem] font-normal text-[var(--text-mid)] [animation-delay:0.35s] [animation-fill-mode:both] opacity-0">
            {profile.tagline}
          </p>
          <div className="animate-fade-up flex flex-wrap gap-3 [animation-delay:0.5s] [animation-fill-mode:both] opacity-0">
            <Link href="/contact" className="btn btn-primary">
              Get in touch
            </Link>
            <Link href="/projects" className="btn btn-outline">
              View projects
            </Link>
            <Link href="/resume" className="btn btn-outline">
              Resume
            </Link>
            {profile.social.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="btn btn-outline"
                target="_blank"
                rel="noreferrer"
              >
                {link.label}
              </a>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[var(--bg-2)] px-[var(--gutter)] py-[var(--space-section)]">
        <div className="mx-auto grid max-w-[1000px] grid-cols-2 gap-4 md:grid-cols-4">
          {profile.stats.map((stat) => (
            <div
              key={stat.label}
              className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--bg-3)] p-6"
            >
              <div className="mb-1 font-[family-name:var(--font-syne)] text-3xl font-bold tracking-tight text-[var(--amber)]">
                {stat.value}
              </div>
              <div className="text-[0.8rem] tracking-wide text-[var(--text-dim)]">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="px-[var(--gutter)] py-[var(--space-section)]">
        <div className="mx-auto max-w-[1000px]">
          <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
            <div>
              <div className="section-label">Featured</div>
              <h2 className="font-[family-name:var(--font-syne)] text-3xl font-bold">
                Selected work
              </h2>
            </div>
            <Link href="/projects" className="text-sm text-[var(--amber)]">
              All projects →
            </Link>
          </div>
          <FeaturedCarousel projects={featured} />
        </div>
      </section>
    </>
  );
}
