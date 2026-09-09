import { expect, test } from "@playwright/test";

/**
 * PLAN.md items 5 + 6: funnel analytics and the /resume print stylesheet.
 *
 * Analytics: the recruiter-conversion actions (social_click, email_click,
 * pdf_download, contact_submit) queue into `window.vaq` — @vercel/analytics
 * queues there whenever the Vercel script isn't loaded, which is exactly the
 * local/CI case, making the queue the observable. contact_submit fires only
 * when the submit actually reaches the server action (client-blocked invalid
 * attempts are validation noise, not conversion intent).
 *
 * Print: Ctrl+P on /resume must produce a clean document — screen chrome
 * (curtain, nav, footer, download button) suppressed, light ink-friendly
 * theme forced, Motion's inline opacity/transform styles neutralized.
 */

/** Read the analytics queue the way the lib leaves it. */
async function readVaq(page: import("@playwright/test").Page): Promise<string> {
  return page.evaluate(() => {
    const w = window as unknown as { vaq?: unknown[] };
    return JSON.stringify(w.vaq ?? []);
  });
}

test.describe("funnel analytics", () => {
  test.beforeEach(async ({ context }) => {
    // Hermetic: outbound social clicks open real tabs to real networks.
    // Block them — the event fires on click, before any navigation.
    await context.route(/linkedin\.com|github\.com/, (route) => route.abort());
  });

  test("social + email + pdf clicks queue their events", async ({ page }) => {
    await page.goto("/");

    // Hero social link (target=_blank → popup opens and is route-blocked).
    const social = page.locator('a[href*="linkedin"]').first();
    await Promise.all([
      page.waitForEvent("popup").catch(() => null), // blocked route may not open one
      social.click(),
    ]);
    expect(await readVaq(page)).toContain("social_click");

    // Footer email (mailto:) — no navigation, pure event.
    await page.locator('footer a[href^="mailto:"]').click();
    expect(await readVaq(page)).toContain("email_click");

    // Resume PDF download.
    await page.goto("/resume");
    await page.locator("a[download]").click();
    expect(await readVaq(page)).toContain("pdf_download");
  });

  test("contact_submit fires only when the action actually runs", async ({
    page,
  }) => {
    await page.goto("/contact");

    // Invalid submit is blocked client-side: no event, no round-trip.
    await page.getByRole("button", { name: /send message/i }).click();
    expect(await readVaq(page)).not.toContain("contact_submit");

    // Valid submit reaches the server action: the event queues.
    await page.getByLabel(/name/i).fill("Analytics Probe");
    await page.getByLabel(/email/i).fill("probe@example.com");
    await page
      .getByLabel(/message/i)
      .fill("Verifying the contact_submit funnel event fires.");
    await page.getByRole("button", { name: /send message/i }).click();
    expect(await readVaq(page)).toContain("contact_submit");
  });
});

test.describe("resume print stylesheet", () => {
  test("print media strips chrome and forces the light document theme", async ({
    page,
  }) => {
    await page.emulateMedia({ media: "print" });
    await page.goto("/resume");

    await expect(page.locator("#intro-curtain")).toBeHidden();
    await expect(page.locator(".site-nav")).toBeHidden();
    await expect(page.locator("footer")).toBeHidden();
    await expect(page.locator("a[download]")).toBeHidden();

    // Ink-friendly: pinned black-on-white regardless of the on-screen theme.
    const body = await page.evaluate(() => {
      const cs = getComputedStyle(document.body);
      return { color: cs.color, background: cs.backgroundColor };
    });
    expect(body.color).toBe("rgb(0, 0, 0)");
    expect(body.background).toBe("rgb(255, 255, 255)");
  });

  test("screen rendering is untouched by the print rules", async ({ page }) => {
    await page.goto("/resume");
    await expect(page.locator(".site-nav")).toBeVisible();
    await expect(page.locator("footer")).toBeVisible();
    await expect(page.locator("a[download]")).toBeVisible();
  });
});
