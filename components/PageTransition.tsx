"use client";

import { usePathname } from "next/navigation";
import { useEffect, useLayoutEffect, useRef } from "react";
import { animate } from "motion";

type Controls = ReturnType<typeof animate>;

/** Direction of a route change, in iOS navigation-stack terms. */
type Direction = "push" | "pop" | "lateral" | "none";

/** Navigation depth: home < top-level pages < project case studies. */
function depthOf(path: string): number {
  if (path === "/") return 0;
  if (/^\/projects\/.+/.test(path)) return 2;
  return 1;
}

function directionBetween(from: string, to: string): Direction {
  const fromDepth = depthOf(from);
  const toDepth = depthOf(to);
  if (fromDepth !== toDepth) return toDepth > fromDepth ? "push" : "pop";
  return from === to ? "none" : "lateral";
}

/**
 * Spring parameters, tuned against Motion's actual generator (tune-springs.mjs):
 * ω₀ = 2π/response, k = ω₀², c = 2ζω₀. Explicit physics keys — not
 * duration/bounce — so the params mean Apple's response (time-to-arrival)
 * and Motion never silently zeroes a hand-off velocity on duration-resolved
 * springs.
 *
 * Push: response 0.30s, ζ 1.0 — critically damped; route changes are taps,
 * not flicks, so no overshoot (§4). ~185ms to 90%, ~400ms perceptual settle.
 * Pop: response 0.35s, ζ 0.95 — a touch quicker than push (iOS pops read
 * faster) with a whisper of life under interruption, 0% measured overshoot.
 */
const SPRING_PUSH = { type: "spring", stiffness: 438.6, damping: 41.9 } as const;
const SPRING_POP = { type: "spring", stiffness: 322.3, damping: 34.1 } as const;

/** How far the incoming page starts off-screen, as a fraction of viewport. */
const ENTER_PUSH = 1; // full width, like UINavigationController push
const ENTER_POP = -0.28; // slides back in part-way, parallaxed like iOS pop
const ENTER_LATERAL = 0.18; // sibling pages: subtle slide from the right

// Layout effect so the from-transform lands before the new page paints
// (no flash of the page at rest). SSR-safe variant.
const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

/** This tab's in-app journey stack (sessionStorage), maintained across ALL
 * route changes. EdgeSwipeBack reads it at commit time to decide between
 * history.back() (in-app arrival — preserves scroll/filter state) and a
 * push to the gallery (deep link). */
export const JOURNEY_KEY = "on-journey";

export function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const ref = useRef<HTMLDivElement | null>(null);
  const prevPathRef = useRef<string | null>(null);
  const controlsRef = useRef<Controls | null>(null);

  useIsomorphicLayoutEffect(() => {
    const prev = prevPathRef.current;
    prevPathRef.current = pathname;
    const el = ref.current;
    if (!el || prev === null || prev === pathname) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const direction = directionBetween(prev, pathname);
    if (direction === "none") return;

    // Journey bookkeeping (exported for EdgeSwipeBack): a move to a page
    // already one below the top pops (the user went back); anything else
    // pushes. Home transitions in from off-screen on first load (prev null
    // returns early above), which correctly seeds the stack.
    try {
      const arr: string[] = JSON.parse(
        sessionStorage.getItem(JOURNEY_KEY) ?? "[]",
      );
      if (arr.length >= 2 && arr[arr.length - 2] === pathname) arr.pop();
      else arr.push(pathname);
      sessionStorage.setItem(JOURNEY_KEY, JSON.stringify(arr));
    } catch {
      // Storage unavailable: EdgeSwipeBack falls back to a gallery push.
    }

    // Freeze document scroll for the transition, then measure. Locking the
    // body (not <html>) preserves the scroll offset across browsers.
    const scrollY0 = window.scrollY;
    const lock = document.body;
    lock.style.overflow = "hidden";
    const width = window.innerWidth;

    const enter =
      direction === "push"
        ? ENTER_PUSH * width
        : direction === "pop"
          ? ENTER_POP * width
          : ENTER_LATERAL * width;

    // Keep the scrolled region pinned under the nav while the page slides:
    // shift the whole page up by the scroll offset, restore real scroll after.
    const pinnedY = -scrollY0;
    el.style.willChange = "transform";
    el.style.transform = `translate3d(${enter}px, ${pinnedY}px, 0)`;

    controlsRef.current?.stop();
    const controls = animate(
      el,
      { x: 0, y: pinnedY },
      direction === "pop" ? SPRING_POP : SPRING_PUSH,
    );
    controlsRef.current = controls;

    const release = () => {
      el.style.transform = "";
      el.style.willChange = "";
      lock.style.overflow = "";
      // Safeguard: pop returns to a page the user was scrolled in. `instant`
      // bypasses the site's scroll-behavior: smooth.
      if (direction === "pop") {
        window.scrollTo({ top: scrollY0, behavior: "instant" });
      }
    };
    void controls.finished.then(release, release);

    // Background tabs throttle rAF, which would stall the spring and leave
    // the scroll lock on. The watchdog frees the lock so the user is never
    // stuck; if the clock resumes, `finished` re-runs release (idempotent).
    const watchdog = window.setTimeout(release, 2000);

    return () => {
      window.clearTimeout(watchdog);
      controls.stop();
      release();
      controlsRef.current = null;
    };
  }, [pathname]);

  return (
    <div ref={ref} className="flex flex-1 flex-col">
      {children}
    </div>
  );
}
