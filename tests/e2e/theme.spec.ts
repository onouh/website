import { expect, test } from "@playwright/test";

/**
 * Theme system: OS-follow default, persisted explicit choice via the
 * toggle, pre-paint boot application (no wrong-palette flash on reload),
 * and the toggle icon swapping with the resolved theme.
 */

const TOGGLE = ".theme-toggle";

test("follows the OS by default (no data-theme attribute)", async ({ page }) => {
  await page.emulateMedia({ colorScheme: "light" });
  await page.goto("/");
  await expect(page.locator("html")).toHaveAttribute("data-curtain-done", "");
  const theme = await page.evaluate(() => document.documentElement.dataset.theme);
  expect(theme, "no explicit theme until the user chooses").toBeUndefined();
  const bg = await page.evaluate(
    () => getComputedStyle(document.body).backgroundColor,
  );
  expect(bg).toBe("rgb(247, 248, 250)"); // light token --bg
});

test("toggle switches to dark, persists across reload (no flash)", async ({
  page,
}) => {
  await page.emulateMedia({ colorScheme: "light" });
  await page.goto("/");
  await page.locator(TOGGLE).click();

  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  const bg = await page.evaluate(
    () => getComputedStyle(document.body).backgroundColor,
  );
  expect(bg).toBe("rgb(5, 7, 12)"); // dark token --bg

  // The choice survives reload — the boot script applies it pre-paint.
  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  const bgAfterReload = await page.evaluate(
    () => getComputedStyle(document.body).backgroundColor,
  );
  expect(bgAfterReload).toBe("rgb(5, 7, 12)");

  // The icon flipped to the sun (click again → light).
  await expect(page.locator(`${TOGGLE} .theme-toggle-sun`)).toBeVisible();
  await page.locator(TOGGLE).click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
  await expect(page.locator(`${TOGGLE} .theme-toggle-moon`)).toBeVisible();
});

test("explicit light choice wins over a dark OS", async ({ page }) => {
  await page.emulateMedia({ colorScheme: "dark" });
  await page.goto("/");

  // OS dark: site resolves dark with no explicit attribute.
  let bg = await page.evaluate(
    () => getComputedStyle(document.body).backgroundColor,
  );
  expect(bg).toBe("rgb(5, 7, 12)");

  await page.locator(TOGGLE).click(); // dark → light
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
  bg = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
  expect(bg, "explicit light beats the dark OS").toBe("rgb(247, 248, 250)");

  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
  bg = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
  expect(bg).toBe("rgb(247, 248, 250)");
});

test("theme token flips the accent family, not just neutrals", async ({
  page,
}) => {
  await page.emulateMedia({ colorScheme: "light" });
  await page.goto("/");
  const amber = () =>
    page.evaluate(
      () => getComputedStyle(document.documentElement).getPropertyValue("--amber").trim(),
    );
  const lightAmber = await amber();
  await page.locator(TOGGLE).click();
  const darkAmber = await amber();
  // getComputedStyle resolves the var chain: --amber → --quantum per theme.
  expect(lightAmber, "light accent").toBe("#1e4ecc");
  expect(darkAmber, "dark accent diverges").toBe("#6b96ff");
});

test("project-card fallback plates adapt per theme (no dark slabs on light)",
  async ({ page }) => {
    await page.emulateMedia({ colorScheme: "light" });
    await page.goto("/projects");
    await expect(page.locator("html")).toHaveAttribute("data-curtain-done", "");

    const plateColor = () =>
      page.evaluate(() => {
        // The no-thumbnail media box: the first card's aspect-ratio plate.
        const plate = document.querySelector(".group > [class*='aspect-']");
        if (!plate) return null;
        // First gradient stop, parsed from the computed background-image.
        const m = getComputedStyle(plate).backgroundImage.match(/rgb\(([\d.]+), ([\d.]+), ([\d.]+)/);
        return m ? [+m[1], +m[2], +m[3]] : null;
      });

    const lightStop = await plateColor();
    expect(lightStop, "plate gradient resolved").not.toBeNull();
    // Light plates are lifted tints (L ≈ 84–88%): every channel bright.
    expect(lightStop![0]).toBeGreaterThan(150);
    expect(lightStop![1]).toBeGreaterThan(150);
    expect(lightStop![2]).toBeGreaterThan(150);

    await page.locator(TOGGLE).click();
    await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
    const darkStop = await plateColor();
    // Dark plates keep the deep brand neighborhood (L ≈ 8–14%): channels dim.
    expect(darkStop![0]).toBeLessThan(80);
    expect(darkStop![1]).toBeLessThan(80);
    expect(darkStop![2]).toBeLessThan(80);
  });
