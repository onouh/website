import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "tests/e2e",
  timeout: 30_000,
  expect: { timeout: 7_000 },
  fullyParallel: false,
  workers: 1,
  retries: 0,
  reporter: [["list"]],
  use: {
    baseURL: "http://127.0.0.1:3111",
    trace: "retain-on-failure",
    // Full-browser headless (channel "chromium") instead of the separate
    // headless-shell download: this machine's Playwright browser cache was
    // wiped mid-session and the CDN re-download kept timing out — but the
    // full chromium-1234 build landed. This runs the suite on it with zero
    // extra downloads.
    channel: "chromium",
    headless: true,
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer: {
    // Keep the fallback-path tests hermetic: .env.local may contain the
    // production Resend key, but these tests deliberately exercise local
    // storage and must never send a real message.
    command:
      "RESEND_API_KEY= CONTACT_TO_EMAIL= CONTACT_FROM_EMAIL= npm run build && RESEND_API_KEY= CONTACT_TO_EMAIL= CONTACT_FROM_EMAIL= npx next start -p 3111",
    url: "http://127.0.0.1:3111",
    reuseExistingServer: !process.env.CI,
    timeout: 240_000,
  },
});
