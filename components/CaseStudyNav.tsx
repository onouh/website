"use client";

import { useEffect, useState } from "react";
import type { CaseStudySection } from "@/lib/project-mdx";

/** Position-based scrollspy for heading-anchored sections. A section is
 * current from its heading until the next heading — so observing the thin
 * h2 itself with IntersectionObserver (a moment-in-the-band signal) would
 * flicker off; instead each scroll frame finds the last heading whose top
 * has crossed the anchor rest line. Headings are few and reads are cheap,
 * so a direct passive scroll handler needs no rAF gate. */
function useHeadingSpy(ids: string[]): string | null {
  const [active, setActive] = useState<string | null>(null);
  const key = ids.join("|");

  useEffect(() => {
    if (!key) return;
    const list = key.split("|");
    const measure = () => {
      // The line sits at the anchor rest position (+1px epsilon): the point
      // a heading settles at after a chip click. Anything else desyncs the
      // spy from what the user just clicked — a short section's successor
      // would already "cross" a 40%-of-viewport line at the anchor. */
      const line = 137;
      let current: string | null = null;
      for (const id of list) {
        const el = document.getElementById(id);
        if (!el) continue;
        // 136 = fixed nav (72) + sticky bar + breathing room.
        if (el.getBoundingClientRect().top - 136 <= line) current = id;
        else break;
      }
      setActive(current);
    };
    measure();
    window.addEventListener("scroll", measure, { passive: true });
    return () => window.removeEventListener("scroll", measure);
  }, [key]);

  return active;
}

/**
 * Sticky section nav for a case study — a floating rounded bar that pins
 * just under the fixed site nav. Anchors are plain #hash links (the h2s
 * carry scroll-margin); the spy lights the section currently being read.
 */
export function CaseStudyNav({ sections }: { sections: CaseStudySection[] }) {
  const spiedId = useHeadingSpy(sections.map((s) => s.id));

  if (sections.length === 0) return null;

  return (
    <nav
      aria-label="Case study sections"
      className="sticky top-[72px] z-30 mb-10 flex list-none items-center gap-2 overflow-x-auto rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--nav-bg)] p-2.5 backdrop-blur-md"
    >
      {sections.map((section) => {
        const active = spiedId === section.id;
        return (
          <a
            key={section.id}
            href={`#${section.id}`}
            aria-current={active ? "true" : undefined}
            className={`related-chip shrink-0 whitespace-nowrap rounded-[var(--radius)] border px-3 py-1 font-[family-name:var(--font-jetbrains)] text-xs uppercase tracking-wide transition-colors ${
              active
                ? "border-[var(--amber-dim)] bg-[var(--amber-glow)] text-[var(--amber)]"
                : "border-[var(--border)] text-[var(--text-mid)] hover:border-[var(--amber-dim)] hover:text-[var(--text)]"
            }`}
          >
            {section.title}
          </a>
        );
      })}
    </nav>
  );
}
