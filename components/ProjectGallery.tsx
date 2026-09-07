"use client";

import { AnimatePresence, LayoutGroup, motion, useReducedMotion } from "motion/react";
import { useState } from "react";
import { ProjectCard } from "@/components/ProjectCard";
import { ProjectFilters } from "@/components/ProjectFilters";
import { filterProjects } from "@/content/projects";
import type { ProjectFilterId } from "@/content/types";

/** Spring for the grid's layout morph — cards glide to their new slot with
 * a whisper of overshoot (visible life, never a rattle). */
const SPRING_LAYOUT = { type: "spring", stiffness: 320, damping: 32 } as const;

/** Enter/exit: short rise, decelerating — same vocabulary as the site's
 * Reveal primitives. Exits are quicker so the grid never feels laggy. */
const ENTER = {
  opacity: 1,
  y: 0,
  scale: 1,
  transition: { duration: 0.4, ease: [0.32, 0.72, 0, 1] as const },
};
const EXIT = {
  opacity: 0,
  y: -10,
  scale: 0.97,
  transition: { duration: 0.22, ease: "easeIn" as const },
};

export function ProjectGallery({ initialFilter }: { initialFilter: ProjectFilterId | "all" }) {
  const reduced = useReducedMotion();
  const [active, setActive] = useState<ProjectFilterId | "all">(initialFilter);
  // If the server render ever hands down a new filter (fresh document load),
  // adopt it during render — React's documented alternative to a mount effect.
  const [prevInitial, setPrevInitial] = useState(initialFilter);
  if (initialFilter !== prevInitial) {
    setPrevInitial(initialFilter);
    setActive(initialFilter);
  }

  const list = filterProjects(active);

  const select = (next: ProjectFilterId | "all") => {
    setActive(next);
    const href = next === "all" ? "/projects" : `/projects?filter=${next}`;
    // Shallow history update: keeps filter links shareable without a server
    // round-trip (Next.js App Router integrates history state with its router).
    window.history.replaceState(null, "", href);
  };

  const chips = (
    <ProjectFilters active={active} onNavigate={select} />
  );

  if (reduced) {
    // Reduced motion: content swaps in place, no transform/opacity work.
    return (
      <>
        {chips}
        <div className="grid gap-6 md:grid-cols-2">
          {list.map((project) => (
            <ProjectCard key={project.slug} project={project} />
          ))}
        </div>
      </>
    );
  }

  return (
    <>
      {chips}
      <LayoutGroup>
        <motion.ul
          className="m-0 grid list-none gap-6 p-0 md:grid-cols-2"
          layout
          transition={SPRING_LAYOUT}
        >
          <AnimatePresence mode="popLayout" initial={false}>
            {list.map((project) => (
              <motion.li
                key={project.slug}
                layout
                transition={SPRING_LAYOUT}
                initial={{ opacity: 0, y: 18, scale: 0.98 }}
                animate={ENTER}
                exit={EXIT}
              >
                <ProjectCard project={project} />
              </motion.li>
            ))}
          </AnimatePresence>
        </motion.ul>
      </LayoutGroup>
    </>
  );
}
