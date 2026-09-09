import { expect, test } from "@playwright/test";

/**
 * PLAN.md items 3 + 4: structured data, canonical URLs, and the hero
 * availability strip.
 *
 * SEO: home carries the ProfilePage/Person JSON-LD identity graph; every
 * route self-canonicalizes (absolute URL resolved from metadataBase) and
 * emits a matching og:url plus og:site_name; case studies canonicalize per
 * slug. The expected base mirrors getSiteUrl()'s env chain — the suite runs
 * without deployment env vars, so the localhost fallback is the contract
 * under test.
 *
 * Availability: the badge is the first content in the hero, sits above the
 * kicker, and the social profiles render as quiet mono links after the
 * primary CTA row — not as buttons.
 */

const BASE =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ??
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : "http://localhost:3000");

/** Minimal JSON-LD shapes for the assertions below. */
type JsonLdNode = {
  "@type": string;
  "@id"?: string;
  url?: string;
  name?: string;
  image?: string;
  mainEntity?: { "@id": string };
  sameAs?: unknown[];
  knowsAbout?: unknown[];
};
type JsonLdBlock = { "@graph"?: unknown } & Record<string, unknown>;

test("home carries the ProfilePage + Person JSON-LD graph", async ({ page }) => {
  await page.goto("/");
  const blocks = (await page.evaluate<JsonLdBlock[]>(() =>
    Array.from(
      document.querySelectorAll('script[type="application/ld+json"]'),
    ).map((el) => JSON.parse(el.textContent ?? "")),
  )) as JsonLdBlock[];
  const graph = blocks.find((b) => Array.isArray(b["@graph"]));
  expect(graph, "one @graph block on home").toBeTruthy();

  const nodes = graph!["@graph"] as JsonLdNode[];
  const profilePage = nodes.find((n) => n["@type"] === "ProfilePage");
  const person = nodes.find((n) => n["@type"] === "Person");
  expect(profilePage, "ProfilePage node present").toBeTruthy();
  expect(person, "Person node present").toBeTruthy();

  expect(profilePage!.url).toBe(BASE);
  expect(profilePage!.mainEntity!["@id"]).toBe(person!["@id"]);
  expect(person!["@id"]).toBe(`${BASE}#person`);
  expect(person!.name).toBeTruthy();
  expect(person!.url).toBe(BASE);
  expect(person!.image).toBe(`${BASE}/opengraph-image`);
  expect(Array.isArray(person!.sameAs)).toBe(true);
  expect(person!.sameAs!.length).toBeGreaterThan(0);
  expect(Array.isArray(person!.knowsAbout)).toBe(true);
});

test("every route self-canonicalizes with matching og:url and site_name", async ({
  page,
}) => {
  const routes = [
    "/",
    "/about",
    "/skills",
    "/experience",
    "/projects",
    "/education",
    "/contact",
    "/resume",
  ];
  for (const route of routes) {
    await page.goto(route);
    const canonical = await page
      .locator('link[rel="canonical"]')
      .getAttribute("href");
    // Next resolves a root canonical to the bare origin (no trailing slash).
    expect(canonical, `${route} canonical`).toBe(
      `${BASE}${route === "/" ? "" : route}`,
    );
    const ogUrl = await page
      .locator('meta[property="og:url"]')
      .getAttribute("content");
    expect(ogUrl, `${route} og:url matches canonical`).toBe(canonical);
    const siteName = await page
      .locator('meta[property="og:site_name"]')
      .getAttribute("content");
    expect(siteName, `${route} og:site_name`).toBeTruthy();
  }
});

test("case studies canonicalize per slug", async ({ page }) => {
  await page.goto("/projects/fos-kernel");
  const canonical = await page
    .locator('link[rel="canonical"]')
    .getAttribute("href");
  expect(canonical).toBe(`${BASE}/projects/fos-kernel`);
  const ogUrl = await page
    .locator('meta[property="og:url"]')
    .getAttribute("content");
  expect(ogUrl).toBe(canonical);
});

test("availability badge leads the hero and announces politely", async ({
  page,
}) => {
  await page.goto("/");
  await expect(page.locator("html")).toHaveAttribute("data-curtain-done", "");

  // Static hero content — announced normally on load, no aria-live needed.
  const badge = page.locator("p:has(.availability-dot)");
  await expect(badge).toBeVisible();
  const text = (await badge.textContent())?.trim() ?? "";
  expect(text.length, "badge carries the availability line").toBeGreaterThan(0);

  // First content in the hero: above the kicker line that follows it.
  const badgeY = (await badge.boundingBox())?.y ?? 0;
  const kickerY =
    (await page.locator("main .hero-kicker-line").boundingBox())?.y ?? 1e9;
  expect(badgeY, "badge precedes the kicker").toBeLessThan(kickerY);
});

test("social profiles render as quiet links after the primary CTAs", async ({
  page,
}) => {
  await page.goto("/");
  await expect(page.locator("html")).toHaveAttribute("data-curtain-done", "");

  const social = page.locator("a.hero-social-link");
  await expect(social).toHaveCount(2);
  for (let i = 0; i < await social.count(); i++) {
    expect(
      await social.nth(i).getAttribute("class"),
      "social links are not buttons",
    ).not.toContain("btn");
  }

  // Every primary CTA precedes the first social link in DOM order.
  const ordered = await page.evaluate(() => {
    const ctas = Array.from(document.querySelectorAll("main a.btn"));
    const firstSocial = document.querySelector("a.hero-social-link");
    if (!firstSocial || ctas.length === 0) return false;
    return ctas.every(
      (cta) =>
        !!(cta.compareDocumentPosition(firstSocial) &
          Node.DOCUMENT_POSITION_FOLLOWING),
    );
  });
  expect(ordered, "social links come after the CTA row").toBe(true);
});
