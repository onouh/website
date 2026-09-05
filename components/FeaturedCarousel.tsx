"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { animate } from "motion";
import { ProjectCard } from "@/components/ProjectCard";
import type { Project } from "@/content/types";

/** Layout constant (px): the gap between slides. The static peek that
 * telegraphs the next slide (§8) comes from the viewport's side padding
 * (the fluid --gutter var), not from any offset here. */
const GAP = 24;

/**
 * Flick threshold (px/s) above which release carries momentum. Tuned
 * (tune-springs.mjs): 350 needs only ~24% slide drag to advance via
 * momentum projection, while a firm 120px/s drag needs 41% — 350 keeps
 * taps decisively tap and flicks decisively flick (§10).
 */
const FLICK_VELOCITY = 350;

/**
 * Spring params from Apple's two knobs: ω₀ = 2π/response, k = ω₀²,
 * c = 2ζω₀. Explicit physics keys — never duration/bounce — because Motion
 * silently zeroes the `velocity` option on duration-resolved springs, which
 * would break velocity handoff (§5).
 *
 * Taps: response 0.40s, ζ 1.0 (critically damped — a dot click has no
 * momentum). ~250ms to 90%, ~560ms perceptual settle over a 671px slide.
 * Flicks: response 0.50s, ζ 0.8 — measures ~11px overshoot (1.6% of a
 * slide) on a 2000px/s release: visible life, never a rattle (§4: bounce
 * only when the gesture carried momentum).
 */
const TAU = Math.PI * 2;
function springFor(responseS: number, zeta: number) {
  const w0 = TAU / responseS;
  return { type: "spring", stiffness: w0 * w0, damping: 2 * zeta * w0 } as const;
}
const SPRING_TAP = springFor(0.4, 1.0);
const SPRING_FLICK = springFor(0.5, 0.8);
/** Drag hysteresis before a gesture becomes a drag (§10). */
const DRAG_THRESHOLD = 10;

/** Auto-advance dwell between slides when the user is idle (§16 Agency:
 * automation runs on a public clock, visibly, and always yields). */
const AUTO_ADVANCE_MS = 6000;

/** Depth hierarchy (§12): neighbors recede with a subtle scale + dim. These
 * must match the .carousel-slide[data-neighbor] stylesheet state exactly, so
 * a drag hands off to the settle transition at identical values. */
const DEPTH_SCALE = 0.045;
const DEPTH_DIM = 0.22;

type Controls = ReturnType<typeof animate>;

/**
 * Apple's momentum projection (Designing Fluid Interfaces): exponential
 * decay, not the textbook v²/2a. d ≈ 0.998 for normal scroll feel.
 */
function projectMomentum(velocity: number, decelerationRate = 0.998) {
  return (velocity / 1000) * (decelerationRate / (1 - decelerationRate));
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

/** Logical → canonical slide index (any integer wraps into [0, count)). */
function wrapIndex(logical: number, count: number) {
  return ((logical % count) + count) % count;
}

/** The nearest integer index equivalent to `target` when coming from
 * `current` — used so dot picks and peeked-slide taps wrap in the direction
 * of least travel (never a long rewind across the strip, §7 spatial
 * consistency: emerge from where you are). */
function nearestWrap(target: number, current: number, count: number) {
  return target + count * Math.round((current - target) / count);
}

/** Current translateX from the live (presentation) transform, for interruption (§3). */
function liveX(el: HTMLElement): number {
  const transform = getComputedStyle(el).transform;
  if (!transform || transform === "none") return 0;
  const matrix = transform.match(/^matrix\(([^)]+)\)$/);
  return matrix ? Number.parseFloat(matrix[1].split(",")[4]) : 0;
}

export function FeaturedCarousel({ projects }: { projects: Project[] }) {
  const count = projects.length;
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const trackRef = useRef<HTMLDivElement | null>(null);
  const controlsRef = useRef<Controls | null>(null);
  const indexRef = useRef(0);
  const historyRef = useRef<{ x: number; t: number }[]>([]);
  const draggedRef = useRef(false);
  const dragRef = useRef({
    active: false,
    pointerId: -1,
    startX: 0,
    startTrackX: 0,
    slideWidth: 0,
    step: 0,
    base: 0,
  });
  const [active, setActive] = useState(0);
  /** null = never started or permanently stopped by user drive. */
  const [autoState, setAutoState] = useState<"idle" | "running" | "stopped">(
    "idle",
  );
  const autoStateRef = useRef<"idle" | "running" | "stopped">("idle");

  /**
   * Deliberate auto-advance (§16 Agency: automation must yield). It runs
   * only while every one of these holds:
   * - the tab is visible (document.visibilitychange)
   * - the carousel is on screen (IntersectionObserver — never moves while
   *   scrolled away)
   * - the pointer is not over it and it does not hold keyboard focus
   * - the user has not taken the wheel: the first drag, dot, arrow key, or
   *   peeked-slide tap stops automation permanently (drivesRef latches)
   * Reduced motion never auto-advances at all (§14).
   */
  const timerRef = useRef<number | null>(null);
  const pausedRef = useRef(false);
  const drivesRef = useRef(false);
  /** Late-bound handle to `goTo` (declared below) — breaks the declaration cycle. */
  const goToRef = useRef<(index: number) => void>(() => {});

  const setAuto = useCallback((state: "idle" | "running" | "stopped") => {
    autoStateRef.current = state;
    setAutoState(state);
  }, []);

  const reducedMotion = useCallback(
    () =>
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    [],
  );

  const syncAuto = useCallback(() => {
    if (timerRef.current !== null) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    if (
      autoStateRef.current !== "running" ||
      pausedRef.current ||
      drivesRef.current ||
      document.hidden ||
      reducedMotion()
    )
      return;
    timerRef.current = window.setTimeout(() => {
      timerRef.current = null;
      goToRef.current(indexRef.current + 1 >= count ? 0 : indexRef.current + 1);
    }, AUTO_ADVANCE_MS);
  }, [count, reducedMotion]);

  /** User takes the wheel: latch permanently stopped AND disarm any armed
   * dwell — without the syncAuto, an already-armed timer could still fire
   * one last advance after the user drove. */
  const stopAuto = useCallback(() => {
    drivesRef.current = true;
    setAuto("stopped");
    syncAuto();
  }, [setAuto, syncAuto]);

  const geometry = useCallback(() => {
    const track = trackRef.current;
    // Slide width as CSS resolves it: 100% of the track's content box (the
    // viewport minus its side padding). Measuring the viewport's clientWidth
    // instead included the padding, so every xForIndex was wrong by an
    // index-proportional drift — later slides rested progressively further
    // from center and could clip past the viewport edge.
    const slideWidth = track ? track.clientWidth : 0;
    const step = slideWidth + GAP;
    return { slideWidth, step, base: 0 };
  }, []);

  /** X for a LOGICAL slide index — any integer, not just [0, count). The
   * strip renders one clone on each side, so indices −1 and count have real
   * slots; springs animate onto clones and `goTo` teleports the track by one
   * strip period after landing, which is visually seamless because a clone
   * is pixel-identical to its real slide. */
  const xForIndex = useCallback(
    (index: number) => {
      const { step } = geometry();
      return -index * step;
    },
    [geometry],
  );

  /**
   * Depth during an active drag: per-slide scale + dim driven by proximity
   * to the focus position, written inline every pointer frame so the dim
   * tracks the finger continuously (§1 — feedback during the gesture, not
   * only at the end). Transform + opacity only (§11). Reduced motion gets
   * the dim without the scale — opacity aids comprehension without a
   * vestibular transform (§14). Proximity 1 (one full slide away) lands on
   * exactly the stylesheet's neighbor values, so release hands off seamlessly.
   */
  const updateDepth = useCallback(
    (track: HTMLElement, trackX: number) => {
      const { step, base } = geometry();
      if (step <= 0) return;
      const scaleDisabled = reducedMotion();
      const slides = track.querySelectorAll<HTMLElement>(".carousel-slide");
      slides.forEach((slide, i) => {
        const proximity = clamp(
          Math.abs(base - i * step - trackX) / step,
          0,
          1,
        );
        slide.style.opacity = String(1 - DEPTH_DIM * proximity);
        if (!scaleDisabled) {
          slide.style.transform = `scale(${1 - DEPTH_SCALE * proximity})`;
        }
      });
    },
    [geometry, reducedMotion],
  );

  /** Spring to a slide — logical index may be any integer; crossing a
   * boundary lands on a clone and teleports home by one strip period.
   * Flicks earn a little bounce; everything else settles critically damped (§4). */
  const goTo = useCallback(
    (index: number, opts?: { velocity?: number; momentum?: boolean }) => {
      const track = trackRef.current;
      if (!track) return;
      indexRef.current = index;
      setActive(wrapIndex(index, count));
      controlsRef.current?.stop();

      if (reducedMotion()) {
        // No motion: land directly on the REAL slide, no clone hop needed.
        const wrapped = wrapIndex(index, count);
        indexRef.current = wrapped;
        track.style.transform = `translate3d(${xForIndex(wrapped)}px, 0, 0)`;
        return;
      }

      track.style.willChange = "transform";
      const targetX = xForIndex(index);
      const controls = animate(
        track,
        { x: targetX },
        {
          ...(opts?.momentum ? SPRING_FLICK : SPRING_TAP),
          // Hand off the release velocity in the spring's travel direction.
          // Positive velocity means the track moves toward higher x values
          // (earlier slides), negative toward lower (later slides).
          ...(opts?.velocity && opts.velocity !== 0
            ? {
                velocity:
                  opts.velocity > 0
                    ? Math.abs(opts.velocity)
                    : -Math.abs(opts.velocity),
              }
            : {}),
        },
      );
      controlsRef.current = controls;
      /** Land on a clone slot (index outside [0, count)) → teleport the track
       * by whole strip periods to the equivalent REAL slot. Same frame, no
       * transition on the track, pixel-identical content: seamless (§3). */
      const normalize = () => {
        const logical = indexRef.current;
        const wrapped = wrapIndex(logical, count);
        if (wrapped !== logical) {
          indexRef.current = wrapped;
          track.style.transform = `translate3d(${xForIndex(wrapped)}px, 0, 0)`;
        }
      };
      void controls.finished.then(
        () => {
          if (controlsRef.current === controls) {
            normalize();
            track.style.willChange = "";
            controlsRef.current = null;
          }
        },
        () => {},
      );
      // Stalled-clock safeguard (throttled rAF in background tabs): if the
      // spring never settles, finalize after it could plausibly have done so.
      // In real browsers `finished` clears `controlsRef` first, so this no-ops.
      window.setTimeout(() => {
        if (controlsRef.current === controls) {
          controls.stop();
          track.style.transform = `translate3d(${targetX}px, 0, 0)`;
          indexRef.current = index;
          normalize();
          track.style.willChange = "";
          controlsRef.current = null;
        }
      }, 1200);
    },
    [count, reducedMotion, xForIndex],
  );

  /** Late-bind `goTo` into the auto-advance timer, re-arming the clock after
   * each automated landing. User-drive paths call `goTo` directly, so they
   * don't re-arm (their latch is set before the call). */
  useEffect(() => {
    goToRef.current = (index: number) => {
      goTo(index);
      syncAuto();
    };
    return () => {
      goToRef.current = () => {};
    };
  }, [goTo, syncAuto]);

  /** Window-level safety net for the pointer gesture: self-removing
   * pointerup/pointercancel listeners so a release OUTSIDE the viewport
   * always settles the drag — even when setPointerCapture failed (or the
   * release landed on an element that stops propagation). Dedupes with the
   * element-level settle via drag.active. */
  const endGestureRef = useRef<((event: PointerEvent) => void) | null>(null);
  /** Late-bound handle to `settle` (declared below) — same pattern as goToRef. */
  const settleRef = useRef<(
    event: React.PointerEvent<HTMLDivElement>,
  ) => void>(() => {});
  const releaseEndGesture = useCallback(() => {
    if (endGestureRef.current) {
      window.removeEventListener("pointerup", endGestureRef.current);
      window.removeEventListener("pointercancel", endGestureRef.current);
      endGestureRef.current = null;
    }
  }, []);

  const onPointerDown = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      if (event.pointerType === "mouse" && event.button !== 0) return;
      const track = trackRef.current;
      const viewport = viewportRef.current;
      if (!track || !viewport) return;

      // Interrupt any flight: grab from the live presentation value (§3).
      controlsRef.current?.stop();
      controlsRef.current = null;
      const startX = liveX(track);
      const { slideWidth, step, base } = geometry();

      dragRef.current = {
        active: true,
        pointerId: event.pointerId,
        startX: event.clientX,
        startTrackX: startX,
        slideWidth,
        step,
        base,
      };
      historyRef.current = [{ x: event.clientX, t: performance.now() }];
      draggedRef.current = false;
      // Capture keeps 1:1 tracking when the pointer leaves the viewport (§2).
      try {
        viewport.setPointerCapture(event.pointerId);
      } catch {
        // Non-capturable pointer (e.g. synthetic): tracking still works inside bounds.
      }
      track.style.willChange = "transform";
      track.style.userSelect = "none";
      // Arm the window safety net for this gesture (previous gesture's net
      // is released first; normally the pointerup fires it and it self-removes).
      releaseEndGesture();
      const endGesture = (pointerEvent: PointerEvent) => {
        // A second finger's release must not disarm the net for the gesture
        // in flight — only the dragging pointer's end events settle it.
        if (dragRef.current.active && pointerEvent.pointerId !== dragRef.current.pointerId)
          return;
        releaseEndGesture();
        settleRef.current({
          pointerId: pointerEvent.pointerId,
          type: pointerEvent.type,
        } as unknown as React.PointerEvent<HTMLDivElement>);
      };
      endGestureRef.current = endGesture;
      window.addEventListener("pointerup", endGesture);
      window.addEventListener("pointercancel", endGesture);
    },
    [geometry, releaseEndGesture],
  );

  const onPointerMove = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      const drag = dragRef.current;
      const track = trackRef.current;
      if (!drag.active || !track || event.pointerId !== drag.pointerId) return;

      const rawDelta = event.clientX - drag.startX;
      if (!draggedRef.current && Math.abs(rawDelta) > DRAG_THRESHOLD) {
        draggedRef.current = true; // hysteresis: taps stay taps (§10)
        // A real drag takes the wheel: automation stops for good. The
        // state-driven depth transition freezes in the same frame.
        stopAuto();
      }

      historyRef.current.push({ x: event.clientX, t: performance.now() });
      const cutoff = performance.now() - 120;
      while (
        historyRef.current.length > 2 &&
        historyRef.current[0].t < cutoff
      ) {
        historyRef.current.shift();
      }

      // 1:1 tracking with no edges — the strip is circular, so past either
      // end the clones simply continue the content (§2, §9: a boundary that
      // doesn't exist can't hard-stop).
      const next = drag.startTrackX + rawDelta;
      // Freeze the state-driven depth transition; inline proximity depth
      // takes over so the dim tracks the finger 1:1 (§1).
      if (draggedRef.current) track.dataset.dragging = "true";
      updateDepth(track, next);
      track.style.transform = `translate3d(${next}px, 0, 0)`;
    },
    [updateDepth, stopAuto],
  );

  const settle = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      const drag = dragRef.current;
      const track = trackRef.current;
      if (!drag.active || !track) return;
      drag.active = false;
      track.style.userSelect = "";
      // Hand depth back to CSS from the last inline values: re-enable the
      // state transition, flush styles so the transition is live while the
      // inline values are still computed, then clear inline depth — the
      // settle animates from the drag's final depth along the mirrored
      // curve (§7), landing on the same values it started from.
      delete track.dataset.dragging;
      void track.offsetWidth;
      const slides = track.querySelectorAll<HTMLElement>(".carousel-slide");
      slides.forEach((slide) => {
        slide.style.transform = "";
        slide.style.opacity = "";
      });

      // pointerup, pointercancel, and lostpointercapture all carry the
      // pointer's id — a foreign pointer's capture loss must not settle an
      // active gesture. drag.active was already cleared above, so a natural
      // up-then-lost sequence dedupes here.
      if (event.pointerId !== drag.pointerId) return;

      // Release velocity from the recent pointer history (§5).
      const history = historyRef.current;
      let velocity = 0;
      if (history.length >= 2) {
        const first = history[0];
        const last = history[history.length - 1];
        const dt = last.t - first.t;
        if (dt > 0) velocity = ((last.x - first.x) / dt) * 1000;
      }

      const current = liveX(track);
      const momentum = Math.abs(velocity) > FLICK_VELOCITY;
      const { step } = drag;
      // Project where the gesture is going, then snap to the nearest slot
      // on the circle (§6) — past the ends, the clones continue the strip.
      const projected = current + (momentum ? projectMomentum(velocity) : 0);
      const rawTarget = Math.round(-projected / step);
      // §10: decide reverse vs commit from the velocity SIGN, not position —
      // a backward flick during a forward drag must go back, not advance.
      let target = rawTarget;
      if (momentum && Math.abs(rawTarget - indexRef.current) > 1) {
        const travel = velocity < 0 ? indexRef.current + 1 : indexRef.current - 1;
        target = travel;
      }
      // Long slow drags can land several slots out; walk back into the
      // rendered range [−1, count] (clone slots included) without a jump.
      while (target < -1) target += count;
      while (target > count) target -= count;
      goTo(target, { velocity, momentum });
    },
    [count, goTo],
  );

  // Late-bind `settle` for the window-level end-gesture safety net.
  useEffect(() => {
    settleRef.current = settle;
    return () => {
      settleRef.current = () => {};
    };
  }, [settle]);

  const onKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>) => {
      const current = indexRef.current;
      if (
        event.key === "ArrowRight" ||
        event.key === "ArrowLeft" ||
        event.key === "Home" ||
        event.key === "End"
      ) {
        event.preventDefault();
        // Keyboard navigation takes the wheel (§16 Agency).
        stopAuto();
      }
      if (event.key === "ArrowRight") {
        goTo(current + 1);
      } else if (event.key === "ArrowLeft") {
        goTo(current - 1);
      } else if (event.key === "Home") {
        goTo(0);
      } else if (event.key === "End") {
        goTo(count - 1);
      }
    },
    [count, goTo, stopAuto],
  );

  /**
   * Click arbitration on the capture phase: a drag swallows the click,
   * a tap on a peeked slide brings it into view (and takes the wheel),
   * a tap on the active slide follows its link.
   */
  const onClickCapture = useCallback((event: React.MouseEvent) => {
    if (draggedRef.current) {
      event.preventDefault();
      event.stopPropagation();
      draggedRef.current = false;
      return;
    }
    const slide = (event.target as HTMLElement).closest<HTMLElement>(
      "[data-slide-index]",
    );
    if (!slide) return;
    const slot = Number(slide.dataset.slideIndex);
    // Resolve the tapped slot (which may be a clone at −1 or count) to the
    // nearest equivalent real slide so the wrap animates in the direction
    // of least travel — a tap on the left peek slides left (§7).
    const slideIndex = wrapIndex(slot, count);
    const logical = nearestWrap(slideIndex, indexRef.current, count);
    if (logical !== indexRef.current) {
      event.preventDefault();
      event.stopPropagation();
      stopAuto(); // driving to a peeked slide is user intent
      goTo(logical);
    }
  }, [count, goTo, stopAuto]);

  // Focus entering an off-screen slide pulls that slide into view.
  const onFocusCapture = useCallback(
    (event: React.FocusEvent) => {
      const slide = (event.target as HTMLElement).closest<HTMLElement>(
        "[data-slide-index]",
      );
      if (!slide) return;
      const slideIndex = Number(slide.dataset.slideIndex);
      if (slideIndex !== indexRef.current) goTo(slideIndex);
    },
    [goTo],
  );

  // Re-measure on resize; keep the active slide pinned without animation.
  useEffect(() => {
    const viewport = viewportRef.current;
    const track = trackRef.current;
    if (!viewport || !track) return;
    const observer = new ResizeObserver(() => {
      controlsRef.current?.stop();
      controlsRef.current = null;
      track.style.willChange = "";
      track.style.transform = `translate3d(${xForIndex(indexRef.current)}px, 0, 0)`;
      track
        .querySelectorAll<HTMLElement>(".carousel-slide")
        .forEach((slide) => {
          slide.style.transform = "";
          slide.style.opacity = "";
        });
    });
    observer.observe(viewport);
    return () => observer.disconnect();
  }, [xForIndex]);

  useEffect(() => () => {
    controlsRef.current?.stop();
    releaseEndGesture();
  }, [releaseEndGesture]);

  /** Auto-advance lifecycle: start when the carousel is meaningfully on
   * screen, and hold the clock at zero while the tab is hidden. */
  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;
    let onScreen = false;
    const observer = new IntersectionObserver(
      (entries) => {
        onScreen = entries.some((entry) => entry.isIntersecting);
        if (onScreen && autoStateRef.current === "idle") setAuto("running");
        syncAuto();
      },
      { threshold: 0.5 },
    );
    observer.observe(viewport);
    document.addEventListener("visibilitychange", syncAuto);
    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", syncAuto);
      if (timerRef.current !== null) window.clearTimeout(timerRef.current);
      timerRef.current = null;
    };
  }, [setAuto, syncAuto]);

  /** The visible control for the automation (§16 Agency): pause/play, plus
   * an honest reset — choosing play is fresh consent, clearing any earlier
   * user-drive stop. */
  const toggleAuto = useCallback(() => {
    if (autoStateRef.current === "running") {
      setAuto("stopped");
    } else {
      drivesRef.current = false;
      setAuto("running");
    }
    syncAuto();
  }, [setAuto, syncAuto]);

  if (count === 0) return null;

  const pauseAuto = () => {
    pausedRef.current = true;
    syncAuto();
  };
  const resumeAuto = () => {
    pausedRef.current = false;
    syncAuto();
  };

  return (
    <div
      onPointerEnter={pauseAuto}
      onPointerLeave={resumeAuto}
      onFocusCapture={pauseAuto}
      onBlurCapture={resumeAuto}
    >
      <div
        ref={viewportRef}
        role="group"
        aria-roledescription="carousel"
        aria-label="Featured projects"
        tabIndex={0}
        className="carousel-viewport -mx-[var(--gutter)] cursor-grab touch-pan-y overflow-hidden px-[var(--gutter)] py-2 outline-offset-4 focus-visible:outline-2 focus-visible:outline-[var(--quantum)] active:cursor-grabbing"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={settle}
        onPointerCancel={settle}
        onLostPointerCapture={settle}
        onKeyDown={onKeyDown}
        onClickCapture={onClickCapture}
        onFocusCapture={onFocusCapture}
      >
        <div ref={trackRef} className="carousel-track flex gap-6">
          {/* Infinite strip: [clone-last, …real slides, clone-first]. Springs
              animate onto a clone when crossing a boundary, then the track
              teleports one period — pixel-identical content, so seamless.
              Clones are visual-only: aria-hidden, unfocusable. */}
          {[
            { key: `clone-last-${projects[count - 1].slug}`, slot: -1, project: projects[count - 1] },
            ...projects.map((project, index) => ({ key: project.slug, slot: index, project })),
            { key: `clone-first-${projects[0].slug}`, slot: count, project: projects[0] },
          ].map(({ key, slot, project }) => {
            const real = slot >= 0 && slot < count;
            // The landing clone carries the focused state during a wrap
            // flight (slot −1 ↔ real count−1, slot count ↔ real 0), so the
            // dim-lift doesn't lag a beat behind the teleport.
            const focused =
              slot === active ||
              (slot === count && active === 0) ||
              (slot === -1 && active === count - 1);
            return (
              <div
                key={key}
                data-slide-index={slot}
                role={real ? "group" : undefined}
                aria-roledescription={real ? "slide" : undefined}
                aria-label={real ? `${slot + 1} of ${count}: ${project.name}` : undefined}
                aria-hidden={real ? undefined : true}
                className="carousel-slide shrink-0"
                data-neighbor={focused ? undefined : ""}
                style={{ width: "100%" }}
              >
                <ProjectCard
                  project={project}
                  tabIndex={real && focused ? undefined : -1}
                />
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-6 flex items-center justify-center gap-3">
        <div className="flex gap-2" role="tablist" aria-label="Choose slide">
        {projects.map((project, index) => (
          <button
            key={project.slug}
            type="button"
            role="tab"
            aria-selected={index === active}
            aria-label={`Go to slide ${index + 1}: ${project.name}`}
            className={`carousel-dot h-2.5 rounded-full transition-all duration-200 active:scale-90 ${
              index === active
                ? "w-6 bg-[var(--amber)]"
                : "w-2.5 bg-[var(--border-2)] hover:bg-[var(--text-dim)]"
            }`}
            onClick={() => {
              stopAuto(); // a deliberate dot pick takes the wheel
              // Least-travel wrap: picking the dot far around the circle
              // slides the short way, never a long rewind (§7).
              goTo(nearestWrap(index, indexRef.current, count));
            }}
          />
        ))}
        </div>
        <button
          type="button"
          className="carousel-auto-toggle flex h-6 w-6 items-center justify-center rounded-full text-[var(--text-dim)] transition-[color,transform] duration-150 hover:text-[var(--text)] active:scale-90"
          aria-pressed={autoState === "running"}
          aria-label={
            autoState === "running"
              ? "Pause auto-rotation"
              : "Play auto-rotation"
          }
          onClick={toggleAuto}
        >
          {autoState === "running" ? (
            <svg width="10" height="10" viewBox="0 0 10 10" aria-hidden>
              <path
                d="M1.5 1h2.4v8H1.5zM6.1 1h2.4v8H6.1z"
                fill="currentColor"
              />
            </svg>
          ) : (
            <svg width="10" height="10" viewBox="0 0 10 10" aria-hidden>
              <path d="M1.5 0.5 9 5 1.5 9.5z" fill="currentColor" />
            </svg>
          )}
        </button>
      </div>
    </div>
  );
}
