"use client";

import { useRef, useState } from "react";
import {
  motion,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useTransform,
  type MotionValue,
} from "motion/react";
import type { ExperienceItem } from "@/content/types";

/**
 * PLAN.md item 11 — prototype: the Experience scroll-story.
 *
 * A pinned stage: the viewport holds still while page scroll scrubs the
 * story. One chapter is active at a time; chapters cross-fade through a
 * defocus blur (the site's "print rather than fade" idiom), the year —
 * the story's spine — turns over with a defocus, a hairline timeline
 * fills with reading progress, and date ticks light up as they're passed.
 *
 * Deliberately prototype-scoped:
 * - Desktop fine pointers only (the `@media (pointer: fine)` gate in CSS).
 *   Touch keeps the stacked timeline — momentum scrolling fights pinning.
 * - Reduced motion renders the stacked timeline (same fallback component).
 * - Backdrop blur on the stage background is fine-pointer-scoped so mobile
 *   Safari doesn't pay the compositor cost.
 *
 * Evaluation checklist for Omar (the questions this prototype answers):
 * 1. Does the pinned hold feel like a story, or like losing the scrollbar?
 *    (Recruiters skim — does the format survive a skimmer?)
 * 2. Is the year-defocus transition legible at scroll speed, or noise?
 * 3. Does the filled timeline bar earn its place as an orientation device?
 * 4. Is the chapter layout (year spine left, prose right) stronger than
 *    the stacked timeline's scan column?
 */

const EASE = [0.32, 0.72, 0, 1] as const;

/** Chapter copy is the existing description (one calm paragraph); bullets
 * stay in the stacked fallback — the story keeps the prose single-thread. */
function Chapter({
  item,
  active,
}: {
  item: ExperienceItem;
  active: boolean;
}) {
  return (
    <motion.article
      className="story-chapter"
      data-active={active ? "" : undefined}
      animate={
        active
          ? { opacity: 1, y: 0, filter: "blur(0px)" }
          : { opacity: 0, y: 16, filter: "blur(6px)" }
      }
      transition={{ duration: 0.45, ease: EASE }}
      aria-hidden={!active}
    >
      <p className="font-[family-name:var(--font-syne)] text-[clamp(1.35rem,2.6vw,1.9rem)] font-semibold leading-tight text-[var(--text)]">
        {item.role}
      </p>
      <p className="mt-2 font-[family-name:var(--font-jetbrains)] text-sm text-[var(--amber)]">
        {item.company}
      </p>
      <p className="mt-6 max-w-[52ch] leading-relaxed text-[var(--text-mid)]">
        {item.description}
      </p>
    </motion.article>
  );
}

/** The year spine: each year turns over with a defocus as its chapter
 * window opens. Remounting on index change keeps the exit/enter motion
 * declarative and hooks legal (no transforms on a changing input). */
function YearSpine({
  items,
  index,
  progress,
}: {
  items: ExperienceItem[];
  index: number;
  progress: MotionValue<number>;
}) {
  const item = items[index];
  const count = items.length;
  const span = 1 / count;
  const start = index * span;
  const nextStart = start + span;
  const fade = span * 0.2;

  // Crossfade windows: each year is fully visible from its chapter start
  // until the next year has landed (20% into the next window), fading out
  // while the incoming one fades in. Chapter 0 is visible at rest (p=0) —
  // the story opens on a readable year, not a blank stage.
  const opacity = useTransform(progress, (p) => {
    if (p < start) return 0;
    if (index > 0 && p < start + fade) return (p - start) / fade;
    if (index < count - 1 && p > nextStart)
      return Math.max(0, 1 - (p - nextStart) / fade);
    return 1;
  });
  const filter = useTransform(progress, (p) => {
    if (p < start) return "blur(10px)";
    if (index > 0 && p < start + fade)
      return `blur(${(1 - (p - start) / fade) * 10}px)`;
    if (index < count - 1 && p > nextStart)
      return `blur(${Math.min(1, (p - nextStart) / fade) * 10}px)`;
    return "blur(0px)";
  });
  const scale = useTransform(progress, (p) => {
    if (p < start) return 1.04;
    if (index > 0 && p < start + fade) return 1.04 - 0.04 * ((p - start) / fade);
    if (index < count - 1 && p > nextStart)
      return 1 - 0.04 * Math.min(1, (p - nextStart) / fade);
    return 1;
  });

  return (
    <motion.span
      key={item?.sortKey ?? index}
      aria-hidden
      className="story-year pointer-events-none absolute inset-0 font-[family-name:var(--font-syne)] font-bold leading-none text-[var(--text)] opacity-[0.07] select-none"
      style={{ scale, opacity, filter }}
    >
      {item?.sortKey.slice(0, 4) ?? ""}
    </motion.span>
  );
}

/** Chapter ticks on the hairline: dot lights up + label lifts once its
 * chapter is reached. Labels are real text, so the pinned section keeps a
 * linear, screen-reader-navigable TOC of the story. */
function StoryTick({
  item,
  progress,
  index,
  span,
}: {
  item: ExperienceItem;
  progress: MotionValue<number>;
  index: number;
  span: number;
}) {
  const dotColor = useTransform(progress, (p) =>
    p >= index * span ? "var(--amber)" : "var(--border-2)",
  );
  const labelOpacity = useTransform(
    progress,
    (p) => (p >= index * span ? 1 : 0.35),
  );

  return (
    <motion.div className="story-tick" style={{ color: dotColor }}>
      <motion.span
        className="story-tick-dot"
        style={{ backgroundColor: dotColor }}
      />
      <motion.span
        className="story-tick-label font-[family-name:var(--font-jetbrains)] text-[0.7rem] tracking-wide"
        style={{ opacity: labelOpacity }}
      >
        {item.date}
      </motion.span>
    </motion.div>
  );
}

export function TimelineStory({ items }: { items: ExperienceItem[] }) {
  const reduced = useReducedMotion();
  const stageRef = useRef<HTMLDivElement | null>(null);
  // useScroll must run unconditionally (hooks before any return); the
  // reduced-motion branch below simply doesn't render the stage.
  const { scrollYProgress } = useScroll({
    target: stageRef,
    offset: ["start start", "end end"],
  });

  const count = items.length;
  const span = 1 / count;
  const [chapterIndex, setChapterIndex] = useState(0);
  useMotionValueEvent(scrollYProgress, "change", (p) => {
    const next = Math.min(Math.floor(p / span), count - 1);
    setChapterIndex((prev) => (prev === next ? prev : next));
  });

  // Timeline hairline fill.
  const barScale = useTransform(scrollYProgress, [0, 1], [0.001, 1]);

  if (reduced) {
    return <TimelineFallback items={items} />;
  }

  return (
    <div
      ref={stageRef}
      className="story-stage"
      style={{ "--chapters": count } as React.CSSProperties}
    >
      {/* Pinned viewport: sticky under the fixed nav (72px). It comes FIRST
          in the DOM — the scrub spacer below it is what the page scrolls
          through while the pin holds. */}
      <div className="story-pin sticky top-[72px] flex h-[calc(100vh-72px)] items-center overflow-hidden">
        <div className="story-backdrop" aria-hidden />
        <div className="relative z-10 mx-auto w-full max-w-[1000px] px-[var(--gutter)] py-16">
          <div className="story-head mb-8 grid items-end gap-x-10 gap-y-6 md:grid-cols-[auto_1fr]">
            <div className="relative h-[clamp(6rem,14vw,10rem)] min-w-[9rem]">
              {/* Outgoing year stays visible until the incoming one lands:
                  render every year, the active one on top. */}
              {items.map((item, index) => (
                <YearSpine
                  key={item.sortKey}
                  items={items}
                  index={index}
                  progress={scrollYProgress}
                />
              ))}
            </div>
            <div className="pb-2">
              <p className="section-label mb-0">03 — Experience</p>
              <h1 className="font-[family-name:var(--font-syne)] text-[clamp(1.75rem,3.5vw,2.5rem)] font-bold leading-[1.1] tracking-tight text-[var(--text)]">
                Where I&apos;ve Worked
              </h1>
            </div>
            <div className="md:col-span-2 mt-8">
              <div className="story-bar">
                <motion.div
                  className="story-bar-fill"
                  style={{ scaleX: barScale }}
                />
              </div>
              <div className="story-ticks" role="presentation">
                {items.map((item, index) => (
                  <StoryTick
                    key={item.sortKey}
                    item={item}
                    progress={scrollYProgress}
                    index={index}
                    span={span}
                  />
                ))}
              </div>
            </div>
          </div>
          <div className="story-chapters relative">
            {items.map((item, index) => (
              <Chapter
                key={`${item.company}-${item.date}`}
                item={item}
                active={index === chapterIndex}
              />
            ))}
          </div>
        </div>
      </div>
      {/* Scrub length: the page scroll that drives one full story pass.
          Sits AFTER the pin — `end end` measures the stage bottom, so the
          pin releases exactly when the bar completes. */}
      <div className="story-length" aria-hidden />
    </div>
  );
}

/** The stacked timeline — the fallback everyone gets on touch/reduced
 * motion, unchanged from production. */
export function TimelineFallback({ items }: { items: ExperienceItem[] }) {
  return (
    <ol className="relative m-0 list-none p-0 before:absolute before:top-2 before:bottom-0 before:left-0 before:w-px before:bg-[var(--border-2)]">
      {items.map((item) => (
        <li
          key={`${item.company}-${item.date}`}
          className="relative mb-12 pl-10 last:mb-0"
        >
          <span
            aria-hidden
            className="absolute top-2 left-[-5px] h-[11px] w-[11px] rounded-full border-2 border-[var(--bg-2)] bg-[var(--amber)] shadow-[0_0_0_3px_rgba(47,107,255,0.15)]"
          />
          <div className="mb-1 flex flex-wrap items-baseline justify-between gap-2">
            <span className="font-[family-name:var(--font-jetbrains)] text-xs tracking-wide text-[var(--amber)]">
              {item.company}
            </span>
            <span className="font-[family-name:var(--font-jetbrains)] text-xs text-[var(--text-dim)]">
              {item.date}
            </span>
          </div>
          <h2 className="mb-3 font-[family-name:var(--font-syne)] text-lg font-semibold text-[var(--text)]">
            {item.role}
          </h2>
          <ul className="m-0 list-disc space-y-2 pl-5 text-[0.9rem] leading-relaxed text-[var(--text-mid)]">
            {item.bullets.map((bullet) => (
              <li key={bullet}>{bullet}</li>
            ))}
          </ul>
        </li>
      ))}
    </ol>
  );
}
