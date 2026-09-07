import { expect, test, type Page } from "@playwright/test";

/**
 * Mobile-nav drawer audit: animated wipe lifecycle, focus trap, scroll
 * lock, backdrop, and the /resume scrollspy.
 */

const BURGER = ".nav-burger";
const PANEL = "#mobile-nav";
const BACKDROP = ".menu-backdrop";

test.describe("mobile drawer (390px viewport)", () => {
  test.use({ viewport: { width: 390, height: 844 } });

  async function openDrawer(page: Page) {
    await page.goto("/");
    await page.locator(BURGER).click();
    await expect(page.locator(PANEL)).toBeVisible();
  }

  test("drawer opens with wipe, moves focus in, locks scroll, shows backdrop", async ({
    page,
  }) => {
    await openDrawer(page);

    const burger = page.locator(BURGER);
    await expect(burger).toHaveAttribute("aria-expanded", "true");
    await expect(page.locator(BACKDROP)).toHaveClass(/menu-backdrop--on/);

    // Focus moved to the first drawer link.
    await expect(page.locator(`${PANEL} a[href]`).first()).toBeFocused();

    // Scroll lock engages on <html> and releases after close.
    const locked = await page.evaluate(
      () => document.documentElement.style.overflow === "hidden",
    );
    expect(locked, "scroll locked while drawer is open").toBe(true);

    await page.keyboard.press("Escape");
    await expect(page.locator(PANEL)).toHaveCount(0);
    await expect(burger).toBeFocused();
    const unlocked = await page.evaluate(
      () => document.documentElement.style.overflow === "",
    );
    expect(unlocked, "scroll restored after close").toBe(true);
  });

  test("focus trap cycles Tab inside the header and wraps both directions", async ({
    page,
  }) => {
    await openDrawer(page);

    // Reachable focusables in DOM order: brand link, burger, drawer links
    // (the desktop list is display:none on this viewport and filtered out).
    // Uniform key: "TAG:href" so links and the button compare consistently.
    const order: string[] = await page.evaluate(() =>
      [
        ...document
          .querySelector("header")!
          .querySelectorAll<HTMLElement>("a[href], button"),
      ]
        .filter((el) => el.getClientRects().length > 0)
        .map((el) => `${el.tagName}:${el.getAttribute("href")}`),
    );
    expect(order.length).toBeGreaterThan(3);
    const first = order[0]; // the brand link
    const last = order[order.length - 1]; // the last drawer link

    // From the last drawer link, Tab wraps to the first focusable (brand).
    const lastHref = last.split(":")[1];
    await page.locator(`${PANEL} a[href="${lastHref}"]`).focus();
    await page.keyboard.press("Tab");
    const afterForward = await page.evaluate(() => {
      const el = document.activeElement;
      return el ? `${el.tagName}:${el.getAttribute("href")}` : null;
    });
    expect(afterForward, "Tab wraps forward to the first focusable").toBe(first);

    // From the FIRST focusable (brand link), Shift+Tab wraps back to the
    // last drawer link — the backward boundary of the trap.
    await page.locator('header a[href="/"]').first().focus();
    await page.keyboard.press("Shift+Tab");
    const afterBack = await page.evaluate(() => {
      const el = document.activeElement;
      return el ? `${el.tagName}:${el.getAttribute("href")}` : null;
    });
    expect(afterBack, "Shift+Tab wraps back to the last link").toBe(last);
  });

  test("drawer closes through a wipe-out animation, not an unmount pop", async ({
    page,
  }) => {
    await openDrawer(page);
    // The panel carries the closing state as it exits…
    await page.locator(BURGER).click();
    await expect(page.locator(PANEL)).toHaveAttribute("data-closing", "");
    // …then the animation ends and React unmounts it.
    await expect(page.locator(PANEL)).toHaveCount(0);
    await expect(page.locator(BURGER)).toHaveAttribute("aria-expanded", "false");
  });

  test("backdrop tap dismisses the drawer", async ({ page }) => {
    await openDrawer(page);
    // The backdrop sits outside the header; a pointerdown on it dismisses.
    await page.mouse.click(195, 600);
    await expect(page.locator(PANEL)).toHaveCount(0);
  });
});

test.describe("scrollspy (desktop nav, /resume)", () => {
  test.use({ viewport: { width: 1280, height: 800 } });

  test("nav spotlights the route whose section is in the reading band", async ({
    page,
  }) => {
    await page.goto("/resume");
    const nav = page.locator("header nav");

    // Default: nothing spied; the current route holds aria-current.
    await expect(nav.locator("[data-spy]")).toHaveCount(0);
    expect(await nav.locator('[aria-current="page"]').getAttribute("href")).toBe(
      "/resume",
    );

    // Scroll the Experience section into the reading band.
    await page.locator("#resume-experience").scrollIntoViewIfNeeded();
    await page.waitForTimeout(400);
    await expect(nav.locator('[data-spy][href="/experience"]')).toBeAttached();
    await expect(nav.locator('[data-spy][href="/skills"]')).toHaveCount(0);

    // Further down, Projects takes the spotlight.
    await page.locator("#resume-projects").scrollIntoViewIfNeeded();
    await page.waitForTimeout(400);
    await expect(nav.locator('[data-spy][href="/projects"]')).toBeAttached();
    await expect(nav.locator('[data-spy][href="/experience"]')).toHaveCount(0);

    // aria-current stays on the route the whole time — the spy is a softer,
    // purely visual signal and never claims page-ness.
    expect(await nav.locator('[aria-current="page"]').getAttribute("href")).toBe(
      "/resume",
    );
  });
});
