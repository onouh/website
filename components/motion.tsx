"use client";

import {
  motion,
  useInView,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
} from "motion/react";
import { useEffect, useRef, type ReactNode } from "react";

/** Plain-element counterpart so reduced motion keeps identical DOM shape. */
function Tag({
  as,
  className,
  children,
}: {
  as: string;
  className?: string;
  children: ReactNode;
}) {
  switch (as) {
    case "section":
      return <section className={className}>{children}</section>;
    case "li":
      return <li className={className}>{children}</li>;
    case "article":
      return <article className={className}>{children}</article>;
    case "span":
      return <span className={className}>{children}</span>;
    case "ul":
      return <ul className={className}>{children}</ul>;
    case "ol":
      return <ol className={className}>{children}</ol>;
    default:
      return <div className={className}>{children}</div>;
  }
}

/* ─── Shared tokens ─────────────────────────────────────────────────────
   One reveal vocabulary for the whole site: a short, decelerating rise
   (materialize, don't just fade — §12 of the site's fluid-interface doc).
   Reduced motion renders content immediately. */

const EASE = [0.32, 0.72, 0, 1] as const;
const REVEAL_MS = 550;

const reveal = {
  hidden: { opacity: 0, y: 18 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: REVEAL_MS / 1000, ease: EASE },
  },
};

function useRevealEnabled() {
  const reduced = useReducedMotion();
  return !reduced;
}

/** Fade-and-rise when the element scrolls into view (once). */
export function Reveal({
  children,
  className,
  delay = 0,
  as = "div",
}: {
  children: ReactNode;
  className?: string;
  /** Seconds; use small steps (0.06–0.12) to cascade siblings. */
  delay?: number;
  as?: "div" | "section" | "li" | "article" | "span";
}) {
  const enabled = useRevealEnabled();
  const MotionTag = motion[as];
  if (!enabled) return <Tag as={as} className={className}>{children}</Tag>;
  return (
    <MotionTag
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "0px 0px -8% 0px" }}
      variants={reveal}
      transition={{ delay }}
    >
      {children}
    </MotionTag>
  );
}

/** Parent that cascades its <Reveal>-less children (plain wrappers).
 * Children rise in sequence when the group scrolls into view. */
export function RevealGroup({
  children,
  className,
  step = 0.08,
  as = "div",
}: {
  children: ReactNode;
  className?: string;
  /** Seconds between each child's start. */
  step?: number;
  as?: "div" | "section" | "ul" | "ol" | "article";
}) {
  const enabled = useRevealEnabled();
  const MotionTag = motion[as];
  if (!enabled) return <Tag as={as} className={className}>{children}</Tag>;
  return (
    <MotionTag
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "0px 0px -8% 0px" }}
      variants={{
        hidden: {},
        visible: { transition: { staggerChildren: step } },
      }}
    >
      {children}
    </MotionTag>
  );
}

/** Child of <RevealGroup>; rises with the group's cascade. */
export function RevealItem({
  children,
  className,
  as = "div",
}: {
  children: ReactNode;
  className?: string;
  as?: "div" | "li" | "article" | "section" | "span";
}) {
  const enabled = useRevealEnabled();
  const MotionTag = motion[as];
  if (!enabled) return <Tag as={as} className={className}>{children}</Tag>;
  return (
    <MotionTag className={className} variants={reveal}>
      {children}
    </MotionTag>
  );
}

/* ─── CountUp ───────────────────────────────────────────────────────────
   Numeric stats count up from zero when scrolled into view. Non-numeric
   values ("5+", "3.6") animate the numeric core and keep the affixes. */

function parseValue(value: string): {
  prefix: string;
  core: number;
  decimals: number;
  suffix: string;
} | null {
  const match = value.match(/^([^\d]*)([\d.]+)(.*)$/);
  if (!match) return null;
  const core = Number.parseFloat(match[2]);
  if (Number.isNaN(core)) return null;
  return {
    prefix: match[1],
    core,
    decimals: match[2].includes(".") ? match[2].split(".")[1].length : 0,
    suffix: match[3],
  };
}

export function CountUp({
  value,
  className,
  duration = 1.4,
}: {
  value: string;
  className?: string;
  /** Seconds for the full count. */
  duration?: number;
}) {
  const enabled = useRevealEnabled();
  const ref = useRef<HTMLSpanElement | null>(null);
  const inView = useInView(ref, { once: true, margin: "0px 0px -10% 0px" });
  const parsed = parseValue(value);

  useEffect(() => {
    if (!enabled || !inView || !parsed) return;
    const el = ref.current;
    if (!el) return;
    const { prefix, core, decimals, suffix } = parsed;
    let raf = 0;
    const t0 = performance.now();
    const tick = (t: number) => {
      const progress = Math.min((t - t0) / (duration * 1000), 1);
      // Ease-out cubic: fast start, soft landing.
      const eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = `${prefix}${(core * eased).toFixed(decimals)}${suffix}`;
      if (progress < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [enabled, inView, parsed, duration]);

  if (!parsed) return <span className={className}>{value}</span>;
  const { prefix, core, decimals, suffix } = parsed;
  const final = `${prefix}${core.toFixed(decimals)}${suffix}`;
  return (
    <span className={className}>
      <span ref={ref} aria-hidden>
        {enabled ? `${prefix}${(0).toFixed(decimals)}${suffix}` : final}
      </span>
      {/* Screen readers get the stable final value, not the ticker. */}
      <span className="sr-only">{value}</span>
    </span>
  );
}

/* ─── ScrollProgress ────────────────────────────────────────────────────
   A hairline under the nav that fills with reading progress. Springed so
   it glides rather than jittering; hidden entirely under reduced motion
   (it conveys nothing vital and is pure chrome). */

export function ScrollProgress() {
  const reduced = useReducedMotion();
  const scrollY = useMotionValue(0);
  const scaleX = useSpring(useTransform(scrollY, [0, 1], [0, 1]), {
    stiffness: 320,
    damping: 34,
  });

  useEffect(() => {
    const sync = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      scrollY.set(max > 0 ? window.scrollY / max : 0);
    };
    sync();
    window.addEventListener("scroll", sync, { passive: true });
    window.addEventListener("resize", sync);
    return () => {
      window.removeEventListener("scroll", sync);
      window.removeEventListener("resize", sync);
    };
  }, [scrollY]);

  if (reduced) return null;
  return (
    <motion.div
      aria-hidden
      className="scroll-progress pointer-events-none absolute inset-x-0 bottom-0 origin-left"
      style={{ scaleX }}
    />
  );
}
