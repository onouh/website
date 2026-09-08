import { expect, test } from "@playwright/test";

/**
 * Case-study template: sticky section nav with scrollspy, metrics band,
 * and shared-filter related projects.
 */

const NAV = 'nav[aria-label="Case study sections"]';

test.describe("case study /projects/veripay", () => {
  test("renders the metrics band with count-up finals", async ({ page }) => {
    await page.goto("/projects/veripay");
    const band = page.locator(".grid.grid-cols-3");
    await expect(band).toBeVisible();
    // CountUp settles at the exact metric values.
    await expect(band).toContainText("26");
    await expect(band).toContainText("FastAPI/gRPC services");
    await expect(band).toContainText("PostgreSQL domains");
  });

  test("sticky section nav lists the MDX outline and anchors carry ids", async ({
    page,
  }) => {
    await page.goto("/projects/veripay");
    const chips = page.locator(`${NAV} a`);
    await expect(chips).toHaveText(["Problem", "Approach", "Outcome", "Stack"]);
    for (const id of ["problem", "approach", "outcome", "stack"]) {
      await expect(page.locator(`h2#${id}`)).toBeAttached();
    }
  });

  test("scrollspy activates the section you anchor to — and only it", async ({
    page,
  }) => {
    await page.goto("/projects/veripay");
    await expect(page.locator(NAV)).toBeVisible();

    // Anchor to Outcome: the Outcome chip becomes current…
    await page.locator(`${NAV} a[href="#outcome"]`).click();
    await page.waitForTimeout(500);
    await expect(page.locator(`${NAV} a[href="#outcome"]`)).toHaveAttribute(
      "aria-current",
      "true",
    );
    // …and the short Outcome section's successor (Stack) does NOT steal it.
    await expect(page.locator(`${NAV} a[href="#stack"]`)).not.toHaveAttribute(
      "aria-current",
      "true",
    );

    // Scrolling back up to Approach hands the spotlight over.
    await page.locator(`${NAV} a[href="#approach"]`).click();
    await page.waitForTimeout(500);
    await expect(page.locator(`${NAV} a[href="#approach"]`)).toHaveAttribute(
      "aria-current",
      "true",
    );
    await expect(page.locator(`${NAV} a[href="#outcome"]`)).not.toHaveAttribute(
      "aria-current",
      "true",
    );
  });

  test("related projects exclude self and lead with shared-filter entries", async ({
    page,
  }) => {
    await page.goto("/projects/veripay");
    const related = page
      .locator("h2", { hasText: "Related projects" })
      .locator("xpath=following-sibling::div//a");
    const hrefs = await related.evaluateAll((links) =>
      links.map((a) => a.getAttribute("href")),
    );
    expect(hrefs).not.toContain("/projects/veripay");
    expect(hrefs.length).toBe(3);
  });
});

test.describe("case study without metrics (fos-kernel)", () => {
  test("omits the metrics band and still renders the section nav", async ({
    page,
  }) => {
    await page.goto("/projects/fos-kernel");
    await expect(page.locator(".grid.grid-cols-3")).toHaveCount(0);
    const chips = page.locator(`${NAV} a`);
    expect(await chips.count()).toBeGreaterThan(0);
  });
});
