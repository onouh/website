import Link from "next/link";
import { AvailabilityBadge } from "@/components/AvailabilityBadge";
import { FeaturedCarousel } from "@/components/FeaturedCarousel";
import { HeroMotion, Magnetic } from "@/components/HeroMotion";
import { TrackedLink } from "@/components/TrackedLink";
import { Reveal, RevealGroup, RevealItem, CountUp } from "@/components/motion";
import { featuredProjects } from "@/content/projects";
import { profile } from "@/content/profile";
import { homeGraph, serializeJsonLd } from "@/lib/jsonld";
import { getSiteUrl } from "@/lib/site";

export default function HomePage() {
  const featured = featuredProjects();

  return (
    <>
      {/* Structured data (PLAN.md item 3): ProfilePage + Person, the identity
          graph for the site. Escaped per the Next.js JSON-LD guide. */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: serializeJsonLd(homeGraph(getSiteUrl())),
        }}
      />
      <HeroMotion>
        <div className="hero-grid-bg" aria-hidden />
        <div className="hero-aurora" aria-hidden />

        <div className="relative mx-auto w-full max-w-[860px]">
          <AvailabilityBadge />
          <p className="animate-rise-in mb-7 inline-flex items-center gap-2 font-[family-name:var(--font-jetbrains)] text-[0.78rem] tracking-[0.1em] text-[var(--amber)] [animation-delay:0.1s] opacity-0">
            <span
              aria-hidden
              className="hero-kicker-line inline-block h-px w-6 bg-[var(--amber)]"
            />
            {profile.title} · {profile.location}
          </p>
          <h1 className="animate-rise-in mb-4 font-[family-name:var(--font-syne)] text-[clamp(3rem,7vw,5.5rem)] leading-none font-bold tracking-[-0.045em] [animation-delay:0.2s] opacity-0">
            {profile.firstName}
            <br />
            {profile.lastName}
            <span className="text-[var(--amber)]">.</span>
          </h1>
          <p className="animate-rise-in mb-10 max-w-[560px] text-[1.15rem] font-normal text-[var(--text-mid)] [animation-delay:0.35s] opacity-0">
            {profile.tagline}
          </p>
          <div className="animate-fade-up flex flex-wrap gap-3 [animation-delay:0.5s] opacity-0">
            <Magnetic>
              <Link href="/contact" className="btn btn-primary">
                Get in touch
              </Link>
            </Magnetic>
            <Magnetic>
              <Link href="/projects" className="btn btn-outline">
                View projects
              </Link>
            </Magnetic>
            <Magnetic>
              <Link href="/resume" className="btn btn-outline">
                Resume
              </Link>
            </Magnetic>
            {/* Social profiles sit one step below the primary CTAs (PLAN.md
                item 4): mono text-links instead of buttons, no magnetic
                wrapper — Get in touch / projects / resume stay the hero's
                pull targets. */}
            <span
              aria-hidden
              className="hidden h-6 w-px bg-[var(--border-2)] sm:inline-block"
            />
            {profile.social.map((link) => (
              <TrackedLink
                key={link.href}
                href={link.href}
                target="_blank"
                rel="noreferrer"
                aria-label={`${link.label} (opens in a new tab)`}
                event="social_click"
                properties={{ network: link.label, placement: "hero" }}
                className="hero-social-link animate-fade-up inline-flex items-center gap-1.5 font-[family-name:var(--font-jetbrains)] text-[0.8rem] text-[var(--text-dim)] [animation-delay:0.6s] opacity-0"
              >
                {link.label}
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-3 w-3"
                  aria-hidden
                >
                  <path d="M7 17 17 7" />
                  <path d="M9 7h8v8" />
                </svg>
              </TrackedLink>
            ))}
          </div>
        </div>
      </HeroMotion>

      <section className="bg-[var(--bg-2)] px-[var(--gutter)] py-[var(--space-section)]">
        <RevealGroup className="mx-auto grid max-w-[1000px] grid-cols-2 gap-4 md:grid-cols-4" step={0.09}>
          {profile.stats.map((stat) => (
            <RevealItem
              key={stat.label}
              className="stat-card rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--bg-3)] p-6"
            >
              <div className="mb-1 font-[family-name:var(--font-syne)] text-3xl font-bold tracking-tight text-[var(--amber)]">
                <CountUp value={stat.value} />
              </div>
              <div className="text-[0.8rem] tracking-wide text-[var(--text-dim)]">
                {stat.label}
              </div>
            </RevealItem>
          ))}
        </RevealGroup>
      </section>

      <section className="px-[var(--gutter)] py-[var(--space-section)]">
        <div className="mx-auto max-w-[1000px]">
          <Reveal className="mb-8 flex flex-wrap items-end justify-between gap-4">
            <div>
              <div className="section-label">Featured</div>
              <h2 className="font-[family-name:var(--font-syne)] text-3xl font-bold">
                Selected work
              </h2>
            </div>
            <Link href="/projects" className="text-sm text-[var(--amber)]">
              All projects →
            </Link>
          </Reveal>
          <Reveal delay={0.15}>
            <FeaturedCarousel projects={featured} />
          </Reveal>
        </div>
      </section>
    </>
  );
}
