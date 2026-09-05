"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef } from "react";
import { animate } from "motion";
import { JOURNEY_KEY } from "@/components/PageTransition";

/**
 * iOS-style interactive back: a swipe from the left edge slides the case
 * study right, 1:1 with the finger, and releases into either a pop-commit
 * (history back, or the projects gallery for deep links) or a spring-back
 * cancel. Matches the push/pop system's physics: explicit stiffness/damping
 * derived from Apple's two knobs (ω₀ = 2π/response, k = ω₀², c = 2ζω₀) —
 * never duration/bounce, which would zero the velocity hand-off (§5).
 *
 * Commit: response 0.25s, ζ 1.0 — the exit feels decisive.
 * Cancel: response 0.30s, ζ 0.95 — a whisper of life on the snap-home.
 *
 * Gesture rules honored: 1:1 tracking with grab-offset continuity, even
 * mid-flight (§2, §3), velocity hand-off at release (§5), commit decided by
 * position + velocity (§10), feedback continuous through the gesture (§1),
 * and the gesture is disabled under reduced motion (§14 — the visible
 * "← Projects" link remains the static equivalent).
 */

const TAU = Math.PI * 2;
const SPRING_COMMIT = {
  type: "spring",
  stiffness: (TAU / 0.25) ** 2,
  damping: 2 * 1.0 * (TAU / 0.25),
} as const;
const SPRING_CANCEL = {
  type: "spring",
  stiffness: (TAU / 0.3) ** 2,
  damping: 2 * 0.95 * (TAU / 0.3),
} as const;

/** Edge zone (px from the left) and intent hysteresis (§10). */
const EDGE_ZONE = 28;
const INTENT_PX = 12;
/** Commit thresholds: distance fraction, or release velocity (px/s). */
const COMMIT_FRACTION = 0.4;
const COMMIT_VELOCITY = 500;

type Controls = ReturnType<typeof animate>;

interface GestureState {
  pending: boolean;
  active: boolean;
  pointerId: number;
  startX: number;
  startY: number;
  /** Track x at grab time — grabs from the live value, even mid-flight (§3). */
  grabX: number;
  width: number;
  pinnedY: number;
  history: { x: number; t: number }[];
}

/** Live track x from the presentation transform (§3). */
function liveX(el: HTMLElement): number {
  const transform = getComputedStyle(el).transform;
  if (!transform || transform === "none") return 0;
  const matrix = transform.match(/^matrix\(([^)]+)\)$/);
  return matrix ? Number.parseFloat(matrix[1].split(",")[4]) : 0;
}

export function EdgeSwipeBack({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const ref = useRef<HTMLDivElement | null>(null);
  const controlsRef = useRef<Controls | null>(null);
  const gesture = useRef<GestureState | null>(null);

  /** Undo every document-level side effect of an active gesture. Idempotent. */
  const releaseDocument = useCallback(() => {
    document.body.style.overflow = "";
    const el = ref.current;
    if (el) {
      el.style.willChange = "";
      el.style.boxShadow = "";
    }
  }, []);

  /** Finish the gesture with a spring from the live position + velocity.
   * `after` runs on landing (commit navigates); otherwise the page snaps
   * home and every side effect is undone. */
  const finishTo = useCallback(
    (
      x: number,
      pinnedY: number,
      spring: typeof SPRING_COMMIT,
      velocity: number,
      after?: () => void,
    ) => {
      const el = ref.current;
      if (!el) {
        releaseDocument();
        return;
      }
      controlsRef.current?.stop();
      const controls = animate(
        el,
        { x, y: pinnedY },
        { ...spring, velocity },
      );
      controlsRef.current = controls;
      let settled = false;
      const done = () => {
        if (settled) return;
        settled = true;
        if (controlsRef.current === controls) controlsRef.current = null;
        if (after) {
          after();
        } else {
          el.style.transform = "";
          releaseDocument();
        }
      };
      void controls.finished.then(done, done);
      // Stalled-clock watchdog (throttled rAF): never strand the scroll lock.
      window.setTimeout(done, 900);
    },
    [releaseDocument],
  );

  const commit = useCallback(() => {
    const g = gesture.current;
    const el = ref.current;
    if (!g || !el) {
      releaseDocument();
      return;
    }
    const pinnedY = g.pinnedY;
    finishTo(g.width + 40, pinnedY, SPRING_COMMIT, 0, () => {
      releaseDocument();
      let journey: string[] = [];
      try {
        journey = JSON.parse(sessionStorage.getItem(JOURNEY_KEY) ?? "[]");
      } catch {
        journey = [];
      }
      if (journey.length > 1) router.back();
      else router.push("/projects");
    });
  }, [finishTo, releaseDocument, router]);

  const cancel = useCallback(() => {
    const g = gesture.current;
    if (!g) {
      releaseDocument();
      return;
    }
    finishTo(0, g.pinnedY, SPRING_CANCEL, 0);
  }, [finishTo, releaseDocument]);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const onTouchStart = (event: TouchEvent) => {
      if (event.touches.length !== 1 || gesture.current) return;
      const touch = event.touches[0];
      if (touch.clientX > EDGE_ZONE) return;
      // Edge origins on the page surface only — never the fixed nav.
      const target = event.target as HTMLElement | null;
      if (target?.closest("header")) return;
      gesture.current = {
        pending: true,
        active: false,
        pointerId: touch.identifier,
        startX: touch.clientX,
        startY: touch.clientY,
        grabX: 0,
        width: window.innerWidth,
        pinnedY: 0,
        history: [],
      };
    };

    const onTouchMove = (event: TouchEvent) => {
      const g = gesture.current;
      const el = ref.current;
      if (!g || !el) return;
      const touch = Array.from(event.touches).find(
        (t) => t.identifier === g.pointerId,
      );
      if (!touch) return;
      const dx = touch.clientX - g.startX;
      const dy = touch.clientY - g.startY;

      if (!g.active) {
        if (Math.abs(dy) > INTENT_PX && Math.abs(dy) > Math.abs(dx)) {
          gesture.current = null; // vertical scroll wins
          return;
        }
        if (dx <= INTENT_PX) return; // not yet a back gesture
        // Activate: freeze scroll, pin content under the nav, and grab from
        // the live position (a mid-flight re-grab continues seamlessly, §3).
        controlsRef.current?.stop();
        controlsRef.current = null;
        g.active = true;
        g.grabX = Math.max(0, liveX(el));
        g.pinnedY = -window.scrollY;
        document.body.style.overflow = "hidden";
        el.style.willChange = "transform";
        el.style.boxShadow = "-24px 0 48px -24px rgba(0,0,0,0.35)";
      }

      // The back gesture is committed: own the touch stream.
      if (event.cancelable) event.preventDefault();
      const x = Math.max(0, g.grabX + dx);
      g.history.push({ x: touch.clientX, t: performance.now() });
      const cutoff = performance.now() - 120;
      while (g.history.length > 2 && g.history[0].t < cutoff) g.history.shift();
      el.style.transform = `translate3d(${x}px, ${g.pinnedY}px, 0)`;
    };

    const onTouchEnd = (event: TouchEvent) => {
      const g = gesture.current;
      if (!g) return;
      if (!g.active) {
        gesture.current = null; // intent never formed: nothing to undo
        return;
      }
      const changed = Array.from(event.changedTouches).find(
        (t) => t.identifier === g.pointerId,
      );
      if (!changed) return;
      // A real drag must not also click whatever sat under the finger.
      if (event.cancelable) event.preventDefault();
      const el = ref.current;
      const current = el ? liveX(el) : 0;
      let velocity = 0;
      if (g.history.length >= 2) {
        const first = g.history[0];
        const last = g.history[g.history.length - 1];
        const dt = last.t - first.t;
        if (dt > 0) velocity = ((last.x - first.x) / dt) * 1000;
      }
      const shouldCommit =
        current > g.width * COMMIT_FRACTION || velocity > COMMIT_VELOCITY;
      if (shouldCommit) commit();
      else cancel();
      gesture.current = null;
    };

    const onTouchCancel = (event: TouchEvent) => {
      const g = gesture.current;
      if (!g) return;
      const ours = Array.from(event.changedTouches).some(
        (t) => t.identifier === g.pointerId,
      );
      if (!ours) return;
      if (g.active) cancel();
      gesture.current = null;
    };

    document.addEventListener("touchstart", onTouchStart, { passive: true });
    document.addEventListener("touchmove", onTouchMove, { passive: false });
    document.addEventListener("touchend", onTouchEnd, { passive: false });
    document.addEventListener("touchcancel", onTouchCancel);
    return () => {
      document.removeEventListener("touchstart", onTouchStart);
      document.removeEventListener("touchmove", onTouchMove);
      document.removeEventListener("touchend", onTouchEnd);
      document.removeEventListener("touchcancel", onTouchCancel);
      // Unmounting mid-gesture (navigation during flight) must never leak
      // the scroll lock or leave a stray spring running.
      controlsRef.current?.stop();
      controlsRef.current = null;
      gesture.current = null;
      releaseDocument();
    };
  }, [cancel, commit, releaseDocument]);

  return (
    <div ref={ref} className="touch-pan-y">
      {children}
    </div>
  );
}
