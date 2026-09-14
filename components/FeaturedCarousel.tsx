"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type {
  CSSProperties,
  FocusEvent,
  KeyboardEvent,
  MouseEvent,
  PointerEvent,
} from "react";
import { ProjectCard } from "@/components/ProjectCard";
import type { Project } from "@/content/types";

const GAP = 24;
const DRAG_THRESHOLD = 10;
const SWIPE_FRACTION = 0.18;
const SWIPE_VELOCITY = 450;
const AUTO_ADVANCE_MS = 6000;
const SLIDE_DURATION_MS = 620;
const SLIDE_TRANSITION =
  "transform 620ms cubic-bezier(0.22, 1, 0.36, 1)";

function wrapIndex(index: number, count: number) {
  return ((index % count) + count) % count;
}

function nearestWrap(target: number, current: number, count: number) {
  return target + count * Math.round((current - target) / count);
}

/** Read the current presentation value, including while a CSS transition is running. */
function liveX(element: HTMLElement) {
  const transform = getComputedStyle(element).transform;
  if (!transform || transform === "none") return 0;
  const matrix = transform.match(/^matrix\(([^)]+)\)$/);
  if (matrix) return Number.parseFloat(matrix[1].split(",")[4]) || 0;
  const matrix3d = transform.match(/^matrix3d\(([^)]+)\)$/);
  if (matrix3d) return Number.parseFloat(matrix3d[1].split(",")[12]) || 0;
  return 0;
}

type Flight = {
  token: number;
  index: number;
  timeout: number;
};

type Drag = {
  active: boolean;
  pointerId: number;
  startX: number;
  startTrackX: number;
  base: number;
  step: number;
};

type AutoState = "idle" | "running" | "stopped";

export function FeaturedCarousel({ projects }: { projects: Project[] }) {
  const count = projects.length;
  const rootRef = useRef<HTMLDivElement | null>(null);
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const trackRef = useRef<HTMLDivElement | null>(null);
  const indexRef = useRef(0);
  const motionTokenRef = useRef(0);
  const flightRef = useRef<Flight | null>(null);
  const dragRef = useRef<Drag>({
    active: false,
    pointerId: -1,
    startX: 0,
    startTrackX: 0,
    base: 0,
    step: 1,
  });
  const historyRef = useRef<{ x: number; t: number }[]>([]);
  const draggedRef = useRef(false);
  const endGestureRef = useRef<((event: globalThis.PointerEvent) => void) | null>(null);
  const finishPointerRef = useRef<(pointerId: number) => void>(() => {});

  const [active, setActive] = useState(0);
  const [logical, setLogical] = useState(0);
  const [autoState, setAutoState] = useState<AutoState>("idle");
  const autoStateRef = useRef<AutoState>("idle");
  const [paused, setPaused] = useState(false);
  const pausedRef = useRef(false);
  const [hidden, setHidden] = useState(false);
  const drivesRef = useRef(false);
  const autoEpochRef = useRef(0);
  const timerRef = useRef<number | null>(null);
  const syncAutoRef = useRef<() => void>(() => {});

  const setAuto = useCallback((state: AutoState) => {
    autoStateRef.current = state;
    setAutoState(state);
  }, []);

  const reducedMotion = useCallback(
    () =>
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    [],
  );

  const geometry = useCallback(() => {
    const viewport = viewportRef.current;
    const track = trackRef.current;
    const firstSlide = track?.querySelector<HTMLElement>(".carousel-slide");
    const slideWidth = firstSlide?.offsetWidth ?? 0;
    const step = slideWidth + GAP;
    const base = viewport ? (viewport.clientWidth - slideWidth) / 2 : 0;
    return { slideWidth, step, base };
  }, []);

  const xForIndex = useCallback(
    (index: number) => {
      const { step, base } = geometry();
      return base - index * step;
    },
    [geometry],
  );

  const setTrackX = useCallback((track: HTMLElement, x: number) => {
    track.style.transform = `translate3d(${x}px, 0, 0)`;
  }, []);

  /** Stop at the live presentation value so a new slide always starts where the eye sees it. */
  const stopMotion = useCallback(() => {
    const track = trackRef.current;
    motionTokenRef.current += 1;
    const flight = flightRef.current;
    if (flight) window.clearTimeout(flight.timeout);
    flightRef.current = null;
    if (!track) return;
    const current = liveX(track);
    track.style.transition = "none";
    setTrackX(track, current);
  }, [setTrackX]);

  /** Normalize only after the clone has been painted at the end of the flight.
   * React state and inline transforms can otherwise race the browser's final
   * transition frame, making a boundary wrap snap back or briefly expose the
   * wrong clone. */
  const normalizeAfterWrap = useCallback(
    (track: HTMLElement, index: number, token: number) => {
      const wrapped = wrapIndex(index, count);
      if (wrapped === index) return;

      const realX = xForIndex(wrapped);
      track.style.transition = "none";
      setTrackX(track, realX);
      indexRef.current = wrapped;
      setLogical(wrapped);

      // Keep the transition disabled until the browser has committed the
      // real-slot position. Two frames cover both the style flush and paint
      // boundary in Chromium/WebKit without adding a visible pause.
      window.requestAnimationFrame(() => {
        if (motionTokenRef.current !== token) return;
        window.requestAnimationFrame(() => {
          if (motionTokenRef.current === token) track.style.transition = "";
        });
      });
    },
    [count, setTrackX, xForIndex],
  );

  const finishMotion = useCallback(
    (token: number) => {
      const flight = flightRef.current;
      const track = trackRef.current;
      if (!track || !flight || flight.token !== token) return;

      flightRef.current = null;
      track.style.transition = "none";
      setTrackX(track, xForIndex(flight.index));

      const wrapped = wrapIndex(flight.index, count);
      if (wrapped !== flight.index) {
        normalizeAfterWrap(track, flight.index, token);
        return;
      }

      window.requestAnimationFrame(() => {
        if (motionTokenRef.current === token) track.style.transition = "";
      });
    },
    [count, normalizeAfterWrap, setTrackX, xForIndex],
  );

  /** One animation path for dots, keyboard, taps, auto-advance, and swipes. */
  const goTo = useCallback(
    (requestedIndex: number) => {
      const track = trackRef.current;
      if (!track) return;

      stopMotion();
      const index = requestedIndex;
      const wrapped = wrapIndex(index, count);
      indexRef.current = index;
      setActive(wrapped);
      setLogical(index);

      if (reducedMotion()) {
        indexRef.current = wrapped;
        setLogical(wrapped);
        setTrackX(track, xForIndex(wrapped));
        return;
      }

      const token = motionTokenRef.current + 1;
      motionTokenRef.current = token;
      const target = xForIndex(index);
      track.style.transition = SLIDE_TRANSITION;
      // Force the current inline position to be committed before changing the
      // target; this makes interrupted transitions continue fluidly.
      void track.offsetWidth;
      setTrackX(track, target);

      const timeout = window.setTimeout(
        () => finishMotion(token),
        SLIDE_DURATION_MS + 80,
      );
      flightRef.current = { token, index, timeout };
    },
    [count, finishMotion, reducedMotion, setTrackX, stopMotion, xForIndex],
  );

  const stopAuto = useCallback(() => {
    drivesRef.current = true;
    autoEpochRef.current += 1;
    setAuto("stopped");
  }, [setAuto]);

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
    ) {
      return;
    }

    const epoch = autoEpochRef.current;
    timerRef.current = window.setTimeout(() => {
      timerRef.current = null;
      if (epoch !== autoEpochRef.current) return;
      goTo(indexRef.current + 1);
      syncAutoRef.current();
    }, AUTO_ADVANCE_MS);
  }, [goTo, reducedMotion]);

  useEffect(() => {
    syncAutoRef.current = syncAuto;
  }, [syncAuto]);

  const releaseEndGesture = useCallback(() => {
    if (!endGestureRef.current) return;
    window.removeEventListener("pointerup", endGestureRef.current);
    window.removeEventListener("pointercancel", endGestureRef.current);
    endGestureRef.current = null;
  }, []);

  const onPointerDown = useCallback(
    (event: PointerEvent<HTMLDivElement>) => {
      if (event.pointerType === "mouse" && event.button !== 0) return;
      const viewport = viewportRef.current;
      const track = trackRef.current;
      if (!viewport || !track) return;

      stopMotion();
      const { base, step } = geometry();
      dragRef.current = {
        active: true,
        pointerId: event.pointerId,
        startX: event.clientX,
        startTrackX: liveX(track),
        base,
        step,
      };
      historyRef.current = [{ x: event.clientX, t: performance.now() }];
      draggedRef.current = false;
      track.style.transition = "none";
      releaseEndGesture();

      try {
        viewport.setPointerCapture(event.pointerId);
      } catch {
        // Synthetic or non-capturable pointers still work inside the viewport.
      }

      const endGesture = (pointerEvent: globalThis.PointerEvent) => {
        if (
          dragRef.current.active &&
          pointerEvent.pointerId !== dragRef.current.pointerId
        ) {
          return;
        }
        releaseEndGesture();
        finishPointerRef.current(pointerEvent.pointerId);
      };
      endGestureRef.current = endGesture;
      window.addEventListener("pointerup", endGesture);
      window.addEventListener("pointercancel", endGesture);
    },
    [geometry, releaseEndGesture, stopMotion],
  );

  const onPointerMove = useCallback(
    (event: PointerEvent<HTMLDivElement>) => {
      const drag = dragRef.current;
      const track = trackRef.current;
      if (!drag.active || !track || event.pointerId !== drag.pointerId) return;

      const delta = event.clientX - drag.startX;
      if (!draggedRef.current && Math.abs(delta) > DRAG_THRESHOLD) {
        draggedRef.current = true;
        stopAuto();
        track.dataset.dragging = "true";
      }

      historyRef.current.push({ x: event.clientX, t: performance.now() });
      const cutoff = performance.now() - 120;
      while (
        historyRef.current.length > 2 &&
        historyRef.current[0].t < cutoff
      ) {
        historyRef.current.shift();
      }

      setTrackX(track, drag.startTrackX + delta);
    },
    [setTrackX, stopAuto],
  );

  const finishPointer = useCallback(
    (pointerId: number) => {
      const drag = dragRef.current;
      const track = trackRef.current;
      if (!drag.active || !track || pointerId !== drag.pointerId) return;

      drag.active = false;
      releaseEndGesture();
      delete track.dataset.dragging;
      track.style.transition = "none";

      const current = liveX(track);
      const delta = current - drag.startTrackX;
      const history = historyRef.current;
      let velocity = 0;
      if (history.length >= 2) {
        const first = history[0];
        const last = history[history.length - 1];
        const elapsed = last.t - first.t;
        if (elapsed > 0) velocity = ((last.x - first.x) / elapsed) * 1000;
      }

      const distanceThreshold = drag.step * SWIPE_FRACTION;
      const committed =
        Math.abs(delta) > distanceThreshold || Math.abs(velocity) > SWIPE_VELOCITY;
      const direction = delta < 0 || velocity < 0 ? 1 : -1;
      const target = committed ? indexRef.current + direction : indexRef.current;
      goTo(target);
    },
    [goTo, releaseEndGesture],
  );

  useEffect(() => {
    finishPointerRef.current = finishPointer;
  }, [finishPointer]);

  const settle = useCallback(
    (event: PointerEvent<HTMLDivElement>) => {
      finishPointerRef.current(event.pointerId);
    },
    [],
  );


  const onKeyDown = useCallback(
    (event: KeyboardEvent<HTMLDivElement>) => {
      if (event.key !== "ArrowRight" && event.key !== "ArrowLeft" && event.key !== "Home" && event.key !== "End") return;
      event.preventDefault();
      stopAuto();
      const current = indexRef.current;
      if (event.key === "ArrowRight") goTo(current + 1);
      if (event.key === "ArrowLeft") goTo(current - 1);
      if (event.key === "Home") goTo(0);
      if (event.key === "End") goTo(count - 1);
    },
    [count, goTo, stopAuto],
  );

  const onClickCapture = useCallback(
    (event: MouseEvent<HTMLDivElement>) => {
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
      const target = nearestWrap(wrapIndex(slot, count), indexRef.current, count);
      if (target === indexRef.current) return;

      event.preventDefault();
      event.stopPropagation();
      stopAuto();
      goTo(target);
    },
    [count, goTo, stopAuto],
  );

  const onFocusCapture = useCallback(
    (event: FocusEvent<HTMLDivElement>) => {
      const slide = (event.target as HTMLElement).closest<HTMLElement>(
        "[data-slide-index]",
      );
      if (!slide) return;
      const slot = Number(slide.dataset.slideIndex);
      if (slot !== indexRef.current) {
        stopAuto();
        goTo(slot);
      }
    },
    [goTo, stopAuto],
  );

  useEffect(() => {
    const viewport = viewportRef.current;
    const track = trackRef.current;
    if (!viewport || !track) return;

    const pinActive = () => {
      stopMotion();
      setTrackX(track, xForIndex(indexRef.current));
      window.requestAnimationFrame(() => {
        if (trackRef.current === track) track.style.transition = "";
      });
    };
    const observer = new ResizeObserver(pinActive);
    observer.observe(viewport);
    pinActive();
    return () => observer.disconnect();
  }, [setTrackX, stopMotion, xForIndex]);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const onHoverIn = () => {
      pausedRef.current = true;
      setPaused(true);
      syncAuto();
    };
    const onHoverOut = () => {
      pausedRef.current = false;
      setPaused(false);
      syncAuto();
    };
    const onFocusIn = () => {
      pausedRef.current = true;
      setPaused(true);
      syncAuto();
    };
    const onFocusOut = (event: globalThis.FocusEvent) => {
      if (event.relatedTarget instanceof Node && root.contains(event.relatedTarget)) return;
      pausedRef.current = false;
      setPaused(false);
      syncAuto();
    };
    root.addEventListener("pointerenter", onHoverIn);
    root.addEventListener("pointerleave", onHoverOut);
    root.addEventListener("focusin", onFocusIn);
    root.addEventListener("focusout", onFocusOut);
    return () => {
      root.removeEventListener("pointerenter", onHoverIn);
      root.removeEventListener("pointerleave", onHoverOut);
      root.removeEventListener("focusin", onFocusIn);
      root.removeEventListener("focusout", onFocusOut);
    };
  }, [syncAuto]);

  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport || reducedMotion()) return;
    let onScreen = false;
    const observer = new IntersectionObserver(
      ([entry]) => {
        onScreen = entry.isIntersecting;
        if (onScreen && autoStateRef.current === "idle") setAuto("running");
        if (!onScreen && timerRef.current !== null) {
          window.clearTimeout(timerRef.current);
          timerRef.current = null;
        }
        syncAuto();
      },
      { threshold: 0.5 },
    );
    observer.observe(viewport);
    const onVisibility = () => {
      setHidden(document.hidden);
      syncAuto();
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
      if (timerRef.current !== null) window.clearTimeout(timerRef.current);
      timerRef.current = null;
    };
  }, [reducedMotion, setAuto, syncAuto]);

  useEffect(
    () => () => {
      stopMotion();
      releaseEndGesture();
      if (timerRef.current !== null) window.clearTimeout(timerRef.current);
    },
    [releaseEndGesture, stopMotion],
  );

  const toggleAuto = useCallback(() => {
    if (autoStateRef.current === "running") {
      autoEpochRef.current += 1;
      setAuto("stopped");
      syncAuto();
      return;
    }
    drivesRef.current = false;
    setAuto("running");
    syncAuto();
  }, [setAuto, syncAuto]);

  if (count === 0) return null;

  const dwell =
    autoState === "running"
      ? paused || hidden
        ? "paused"
        : "running"
      : "off";
  const dwellKey = `${active}:${dwell}`;

  return (
    <div ref={rootRef}>
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
          {[
            {
              key: `clone-last-${projects[count - 1].slug}`,
              slot: -1,
              project: projects[count - 1],
            },
            ...projects.map((project, index) => ({
              key: project.slug,
              slot: index,
              project,
            })),
            {
              key: `clone-first-${projects[0].slug}`,
              slot: count,
              project: projects[0],
            },
          ].map(({ key, slot, project }) => {
            const real = slot >= 0 && slot < count;
            const focused = slot === logical;
            return (
              <div
                key={key}
                data-slide-index={slot}
                role={real ? "group" : undefined}
                aria-roledescription={real ? "slide" : undefined}
                aria-label={
                  real ? `${slot + 1} of ${count}: ${project.name}` : undefined
                }
                aria-hidden={real ? undefined : true}
                className="carousel-slide shrink-0"
                data-neighbor={focused ? undefined : ""}
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

      <div
        key={dwellKey}
        className="carousel-progress"
        data-dwell={dwell}
        style={{ "--dwell-ms": `${AUTO_ADVANCE_MS}ms` } as CSSProperties}
        aria-hidden
      />

      <div className="mt-6 flex items-center justify-center gap-3">
        <div className="flex gap-2" role="tablist" aria-label="Choose slide">
          {projects.map((project, index) => (
            <button
              key={project.slug}
              type="button"
              role="tab"
              aria-selected={index === active}
              aria-label={`Go to slide ${index + 1}: ${project.name}`}
              className={`carousel-dot ${index === active ? "carousel-dot--active" : ""}`}
              onClick={() => {
                stopAuto();
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
          data-tip={
            autoState === "running"
              ? "Pause auto-rotation"
              : "Play auto-rotation"
          }
          title={
            autoState === "running"
              ? "Pause auto-rotation"
              : "Play auto-rotation"
          }
          onClick={toggleAuto}
        >
          {autoState === "running" ? (
            <svg width="10" height="10" viewBox="0 0 10 10" aria-hidden>
              <path d="M1.5 1h2.4v8H1.5zM6.1 1h2.4v8H6.1z" fill="currentColor" />
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
