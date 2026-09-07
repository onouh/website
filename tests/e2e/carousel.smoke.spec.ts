import { expect, test, type Page } from "@playwright/test";

/**
 * Featured-carousel smoke test.
 *
 * Drives every dot and both wrap paths (forward past the last slide,
 * backward past the first) and asserts, after each transition settles,
 * the invariants that caught the original "wrong card" bug:
 *
 *   1. The strip is settled — no WAAPI/CSS animation is still running on
 *      the track subtree (guards against flights wedged mid-transition).
 *   2. Exactly one full-depth slide (no data-neighbor attribute).
 *   3. That slide is the REAL slide whose aria-label matches the selected
 *      dot — never a clone (aria-hidden), never the card after/before.
 *   4. Dots and slides agree: the selected dot's index maps to the
 *      focused slide's index.
 */

const DOT = '[role="tablist"] button[role="tab"]';

type Probe = {
  selectedDot: number;
  selectedLabel: string | null;
  focusedLabel: string | null;
  fullDepthCount: number;
  fullDepthIsClone: boolean;
  trackX: number;
  animating: number;
};

/** Read all invariants in one pass, in the page. */
async function probe(page: Page): Promise<Probe> {
  return page.evaluate(`
    (() => {
      const track = document.querySelector(".carousel-track");
      const dots = [...document.querySelectorAll('[role="tablist"] button[role="tab"]')];
      const sel = dots.findIndex((d) => d.getAttribute("aria-selected") === "true");
      const slides = [...track.querySelectorAll(".carousel-slide")];
      const full = slides.filter((s) => !s.hasAttribute("data-neighbor"));
      const trackRect = track.getBoundingClientRect();
      return {
        selectedDot: sel,
        selectedLabel: sel >= 0 ? dots[sel].getAttribute("aria-label") : null,
        focusedLabel: full.length === 1 ? full[0].getAttribute("aria-label") : null,
        fullDepthCount: full.length,
        fullDepthIsClone: full.length === 1 && full[0].getAttribute("aria-hidden") === "true",
        trackX: trackRect.x,
        // Only the flight itself — the track element's own animations.
        // Subtree would catch unrelated card-child CSS loops.
        animating: track.getAnimations().filter((a) => a.playState === "running").length,
      };
    })()
  `);
}

/** Wait for the current flight to finish and the strip to be settled. */
async function settle(page: Page) {
  await page.waitForFunction(
    `document.querySelector(".carousel-track").getAnimations()
       .filter((a) => a.playState === "running").length === 0`,
    undefined,
    { timeout: 10_000, polling: 120 },
  );
}

/** The interactive dot count is the slide count — one dot per slide. */
async function slideCount(page: Page): Promise<number> {
  return page.locator(DOT).count();
}

/** Assert every invariant after a transition lands on `dotIndex`. */
async function assertLandedOn(page: Page, dotIndex: number, name: string) {
  const count = await slideCount(page);
  await settle(page);
  // One extra frame: let React commit the post-normalize state after a wrap.
  await page.waitForTimeout(150);
  const p = await probe(page);
  // Dot label: "Go to slide N: Name" · Slide label: "N of <count>: Name"
  const dotName = p.selectedLabel?.replace(/^Go to slide \d+: /, "") ?? null;
  const slideName = p.focusedLabel?.replace(/^\d+ of \d+: /, "") ?? null;
  expect(p.animating, `${name}: strip settled`).toBe(0);
  expect(p.selectedDot, `${name}: dot ${dotIndex} selected`).toBe(dotIndex);
  expect(p.fullDepthCount, `${name}: exactly one full-depth slide`).toBe(1);
  expect(p.fullDepthIsClone, `${name}: focus never rests on a clone`).toBe(false);
  expect(
    p.focusedLabel,
    `${name}: focused slide is slide ${dotIndex + 1}`,
  ).toMatch(new RegExp(`^${dotIndex + 1} of ${count}: `));
  expect(slideName, `${name}: focused card matches selected dot`).toBe(dotName);
}

test.beforeEach(async ({ page }) => {
  // Bypass the intro curtain before any app script runs (it reads this
  // key pre-paint). Real springs run — the settle() helper waits for the
  // WAAPI flights to drain, which also exercises the clone-hop wrap path.
  await page.addInitScript(() => {
    try {
      sessionStorage.setItem("intro-seen", "1");
    } catch {}
  });
  await page.goto("/");
  // The first deliberate interaction (a dot click) stops auto-advance
  // permanently, so automation can never race the assertions.
  const carousel = page.locator('[aria-roledescription="carousel"]');
  await carousel.scrollIntoViewIfNeeded();
  await expect(carousel).toBeVisible();
});

test("every dot lands its own card, centered and in sync", async ({ page }) => {
  const dots = page.locator(DOT);
  const count = await slideCount(page);
  expect(count, "carousel has slides to drive").toBeGreaterThanOrEqual(2);

  for (let i = 0; i < count; i++) {
    await dots.nth(i).click();
    await assertLandedOn(page, i, `dot ${i}`);
  }

  // Track must actually translate between distinct positions.
  await dots.nth(0).click();
  await settle(page);
  const x0 = (await probe(page)).trackX;
  await dots.nth(1).click();
  await settle(page);
  const x1 = (await probe(page)).trackX;
  expect(Math.abs(x1 - x0), "adjacent dots move the strip").toBeGreaterThan(100);
});

test("forward wrap: last slide → first slides left onto the clone and lands real", async ({
  page,
}) => {
  const dots = page.locator(DOT);
  const last = (await slideCount(page)) - 1;
  await dots.nth(last).click();
  await assertLandedOn(page, last, "setup: on last slide");

  // Wrap forward via keyboard (also exercises the ArrowRight path). Focus
  // the viewport first — key handling lives there, like a real keyboard user
  // tabbing to the carousel.
  await page.locator('[aria-roledescription="carousel"]').focus();
  await page.keyboard.press("ArrowRight");
  await assertLandedOn(page, 0, "forward wrap");

  // And again with the dot itself: dot 0 from the last slide goes the short way.
  await dots.nth(last).click();
  await assertLandedOn(page, last, "back to last");
  await dots.nth(0).click();
  await assertLandedOn(page, 0, `dot wrap ${last}→0`);
});

test("backward wrap: first slide → last slides right onto the clone and lands real", async ({
  page,
}) => {
  const dots = page.locator(DOT);
  const last = (await slideCount(page)) - 1;
  await dots.nth(0).click();
  await assertLandedOn(page, 0, "setup: on first slide");

  await page.locator('[aria-roledescription="carousel"]').focus();
  await page.keyboard.press("ArrowLeft");
  await assertLandedOn(page, last, "backward wrap");

  // Dot-driven wrap back the other way: last dot from slide 0.
  await dots.nth(last).click();
  await assertLandedOn(page, last, `dot wrap 0→${last}`);
});

test("rapid dot mashing never leaves a wedged or desynced strip", async ({ page }) => {
  const dots = page.locator(DOT);
  const last = (await slideCount(page)) - 1;
  // A scramble that revisits both wrap boundaries and ends on slide 0.
  const order = last >= 2 ? [1, last, 0, last, 1, 0] : [1, 0, 1, 0];
  for (const i of order) {
    await dots.nth(i).click({ delay: 20 });
    // No settle between clicks: queue the transitions on purpose.
  }
  await assertLandedOn(page, order[order.length - 1], "after mash");
});

test("auto-advance stop latch: dot click stops the rotation permanently", async ({
  page,
}) => {
  const dots = page.locator(DOT);
  await dots.nth(1).click();
  await assertLandedOn(page, 1, "after user takes the wheel");

  // Dwell is 6s; if automation were still alive it would have advanced.
  const before = await probe(page);
  await page.waitForTimeout(7_000);
  const after = await probe(page);
  expect(after.selectedDot, "dot unchanged past the dwell").toBe(before.selectedDot);
  expect(after.animating, "strip stays settled").toBe(0);
});
