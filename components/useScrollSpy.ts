"use client";

import { useEffect, useState } from "react";

/**
 * Tracks which of the given section ids currently sits in the reading band
 * (a horizontal strip ~35–55% down the viewport). Returns the id or null.
 *
 * IntersectionObserver-based; if an environment never delivers callbacks,
 * the spy simply stays null and callers fall back to route highlighting —
 * degradation, never breakage.
 */
export function useScrollSpy(ids: string[]): string | null {
  const [active, setActive] = useState<string | null>(null);
  // Stable dep: the joined key, so callers can pass a fresh array each render.
  const key = ids.join("|");

  useEffect(() => {
    if (!key) return;
    if (typeof IntersectionObserver === "undefined") return;
    const list = key.split("|");
    const inBand = new Map<string, boolean>();
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          inBand.set(entry.target.id, entry.isIntersecting);
        }
        // First (topmost) tracked section inside the band wins.
        setActive(list.find((id) => inBand.get(id)) ?? null);
      },
      // The "reading line": a narrow band 35–55% down the viewport. A
      // section is current while it crosses the line you're reading at.
      { rootMargin: "-35% 0px -45% 0px", threshold: 0 },
    );
    for (const id of list) {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    }
    return () => observer.disconnect();
  }, [key]);

  return active;
}
