import { expect, test } from "@playwright/test";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

/**
 * PLAN.md item 2: contact delivery truthfulness + spam guard.
 *
 * Every submit path must end in a truthful state:
 * - honeypot / too-fast  → acknowledged ("Message received."), never stored,
 *   no mailto escape hatch (a bot learns nothing);
 * - human, no API key    → stored locally (dev convenience) with the mailto
 *   fallback offered — on serverless the same shape degrades to an honest
 *   error + mailto (the old code faked ok:true there);
 * - invalid input        → blocked client-side before any delivery attempt.
 *
 * The `.data/contact.jsonl` count is the ground truth for "was it stored":
 * junk must leave no line behind, a real message must leave exactly one.
 */

const DATA_FILE = join(process.cwd(), ".data", "contact.jsonl");

function storedCount(): number {
  try {
    if (!existsSync(DATA_FILE)) return 0;
    return readFileSync(DATA_FILE, "utf8").trim().split("\n").filter(Boolean)
      .length;
  } catch {
    return 0;
  }
}

const HUMAN = {
  name: "Recruiter Test",
  email: "recruiter@example.com",
  message: "A genuine message, long enough to pass validation.",
};

async function fillHumanForm(page: {
  getByLabel: (label: string) => { fill: (value: string) => Promise<void> };
}) {
  await page.getByLabel("Name").fill(HUMAN.name);
  await page.getByLabel("Email").fill(HUMAN.email);
  await page.getByLabel("Message").fill(HUMAN.message);
}

test("honeypot submission is acknowledged but never stored", async ({
  page,
}) => {
  await page.goto("/contact");
  // Human-paced, so the ONLY guard that can trip is the honeypot.
  await page.waitForTimeout(3500);
  await fillHumanForm(page);
  await page
    .locator("#contact-website")
    .evaluate((el) => {
      (el as HTMLInputElement).value = "https://spam.example";
    });
  const before = storedCount();
  await page.getByRole("button", { name: "Send message" }).click();

  await expect(page.getByText("Message received.")).toBeVisible();
  // The skip path must not hand a bot the mailto escape hatch.
  await expect(page.getByRole("link", { name: "Open mail app" })).toHaveCount(
    0,
  );
  expect(storedCount()).toBe(before);
});

test("too-fast submission (inside the 3s floor) is acknowledged but never stored", async ({
  page,
}) => {
  await page.goto("/contact");
  await page.waitForLoadState("networkidle");
  const before = storedCount();
  // Fill and submit in one script, the way a bot would — the whole span from
  // mount to submit stays under the server's MIN_FILL_MS floor.
  await page.evaluate(() => {
    const set = (selector: string, value: string) => {
      const el = document.querySelector(selector) as
        | HTMLInputElement
        | HTMLTextAreaElement;
      const proto =
        el instanceof HTMLTextAreaElement
          ? HTMLTextAreaElement.prototype
          : HTMLInputElement.prototype;
      Object.getOwnPropertyDescriptor(proto, "value")?.set?.call(el, value);
      el.dispatchEvent(new Event("input", { bubbles: true }));
    };
    set('input[name="name"]', "Instant Bot");
    set('input[name="email"]', "instant@example.com");
    set('textarea[name="message"]', "Submitted inside the fill-time window.");
    (document.querySelector("form") as HTMLFormElement).requestSubmit();
  });

  await expect(page.getByText("Message received.")).toBeVisible();
  await expect(page.getByRole("link", { name: "Open mail app" })).toHaveCount(
    0,
  );
  expect(storedCount()).toBe(before);
});

test("human-paced submission is stored and offers the mailto fallback", async ({
  page,
}) => {
  await page.goto("/contact");
  // Clear the fill-time floor, then fill like a person.
  await page.waitForTimeout(3500);
  await fillHumanForm(page);
  const before = storedCount();
  await page.getByRole("button", { name: "Send message" }).click();

  // No RESEND_API_KEY locally: the honest success is the local store plus the
  // mailto fallback (on serverless the same shape degrades to an error with
  // the same fallback — never a fake ok).
  await expect(
    page.getByText("Saved. If you prefer, you can also email me directly."),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: "Open mail app" }),
  ).toBeVisible();
  expect(storedCount()).toBe(before + 1);
});

test("invalid submit is blocked client-side before any delivery attempt", async ({
  page,
}) => {
  await page.goto("/contact");
  await page.waitForLoadState("networkidle");
  const before = storedCount();
  await page.getByRole("button", { name: "Send message" }).click();

  await expect(page.getByText("Please enter your name.")).toBeVisible();
  expect(storedCount()).toBe(before);
});
