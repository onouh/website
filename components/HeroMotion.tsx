"use client";

import {
  motion,
  useMotionTemplate,
  useMotionValue,
  useReducedMotion,
  useSpring,
} from "motion/react";
import { useEffect, useRef, type ReactNode } from "react";

/**
 * Cursor-following spotlight + magnetic hover for the hero (§14 of the
 * site's fluid-interface notes: enhancement, never a dependency).
 *
 * - Spotlight: a soft radial glow that trails the pointer on a stiff spring
 *   (it lags just enough to feel physical, never jittery). Pure transform,
 *   pointer-events: none, behind the content.
 * - Magnetic buttons: CTAs lean toward the cursor within a small radius.
 *   Release springs back — the same critically-damped character as the
 *   site's buttons.
 *
 * Gated to fine pointers via matchMedia("pointer: fine") — touch devices
 * have no hover cursor, so neither effect runs. Reduced motion disables
 * both. The component renders children unchanged in every case.
 */

/** Magnetic pull radius around a CTA, px. */
const MAGNET_RADIUS = 110;

export function HeroMotion({ children }: { children: ReactNode }) {
  const reduced = useReducedMotion();
  const sectionRef = useRef<HTMLElement | null>(null);
  const fineRef = useRef(false);

  // Spotlight
  const mx = useMotionValue(-600);
  const my = useMotionValue(-600);
  const sx = useSpring(mx, { stiffness: 180, damping: 26, mass: 0.6 });
  const sy = useSpring(my, { stiffness: 180, damping: 26, mass: 0.6 });
  const spotlight = useMotionTemplate`radial-gradient(320px circle at ${sx}px ${sy}px, var(--amber-glow), transparent 70%)`;

  useEffect(() => {
    if (reduced) return;
    const fine = window.matchMedia("(pointer: fine)");
    fineRef.current = fine.matches;
    const onFineChange = (event: MediaQueryListEvent) => {
      fineRef.current = event.matches;
    };
    fine.addEventListener?.("change", onFineChange);

    const section = sectionRef.current;
    if (!section) return () => fine.removeEventListener?.("change", onFineChange);

    const onMove = (event: PointerEvent) => {
      if (!fineRef.current) return;
      const rect = section.getBoundingClientRect();
      mx.set(event.clientX - rect.left);
      my.set(event.clientY - rect.top);
    };
    const onLeave = () => {
      // Park the glow off-stage so it fades out rather than freezing mid-hero.
      mx.set(-600);
      my.set(-600);
    };
    section.addEventListener("pointermove", onMove);
    section.addEventListener("pointerleave", onLeave);
    return () => {
      fine.removeEventListener?.("change", onFineChange);
      section.removeEventListener("pointermove", onMove);
      section.removeEventListener("pointerleave", onLeave);
    };
  }, [mx, my, reduced]);

  if (reduced) return <>{children}</>;
  return (
    <section
      ref={sectionRef}
      className="relative flex min-h-[calc(100vh-72px)] flex-col justify-center overflow-hidden px-[var(--gutter)] py-[var(--space-hero)]"
    >
      <motion.div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{ background: spotlight }}
      />
      {children}
    </section>
  );
}

/** Magnetic CTA: leans toward the cursor while it's nearby. Must wrap a
 * single button/link child (the transform applies to the wrapper). */
export function Magnetic({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const reduced = useReducedMotion();
  const ref = useRef<HTMLSpanElement | null>(null);
  const x = useSpring(useMotionValue(0), { stiffness: 260, damping: 24 });
  const y = useSpring(useMotionValue(0), { stiffness: 260, damping: 24 });

  useEffect(() => {
    if (reduced) return;
    const el = ref.current;
    if (!el) return;
    const onMove = (event: PointerEvent) => {
      const rect = el.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = event.clientX - cx;
      const dy = event.clientY - cy;
      const distance = Math.hypot(dx, dy);
      if (distance < MAGNET_RADIUS + Math.max(rect.width, rect.height) / 2) {
        const strength = 1 - Math.min(distance / MAGNET_RADIUS, 1);
        x.set(dx * strength * 0.12);
        y.set(dy * strength * 0.12);
      } else {
        x.set(0);
        y.set(0);
      }
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, [x, y, reduced]);

  if (reduced) return <span className={className}>{children}</span>;
  return (
    <motion.span ref={ref} className={className} style={{ x, y }}>
      {children}
    </motion.span>
  );
}
