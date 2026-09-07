import Link from "next/link";
import { FeaturedCarousel } from "@/components/FeaturedCarousel";
import { HeroMotion, Magnetic } from "@/components/HeroMotion";
import { Reveal, RevealGroup, RevealItem, CountUp } from "@/components/motion";
import { featuredProjects } from "@/content/projects";
import { profile } from "@/content/profile";

export default function HomePage() {
  const featured = featuredProjects();

  return (
    <>
      <HeroMotion>
        <div className="hero-grid-bg" aria-hidden />
        <div className="hero-aurora" aria-hidden />

        <div className="relative mx-auto w-full max-w-[860px]">
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
            {profile.social.map((link) => (
              <Magnetic key={link.href}>
                <a
                  href={link.href}
                  className="btn btn-outline"
                  target="_blank"
                  rel="noreferrer"
                >
                  {link.label}
                </a>
              </Magnetic>
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
