import { defineConfig, devices } from "@playwright/test";

const APP_PORT = 3100;
const isCI = !!process.env.CI;
const E2E_DATABASE_URL = "file:./data/e2e.db";

export default defineConfig({
  testDir: "./e2e",
  testMatch: "**/*.spec.ts",
  fullyParallel: false,
  workers: 1,
  forbidOnly: isCI,
  retries: isCI ? 1 : 0,
  reporter: [["list"], ["html", { open: "never" }]],
  use: {
    baseURL: `http://localhost:${APP_PORT}`,
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
        // CI uses Playwright's bundled Chromium. Locally the installed Chrome is used,
        // because Playwright no longer ships Chromium for older macOS versions.
        channel: isCI ? undefined : "chrome",
      },
    },
  ],
  webServer: {
    // A dedicated database, reset and seeded on every run, so e2e never touches dev data.
    command: `npm run db:reset && npm run build && npm run start -- -p ${APP_PORT}`,
    url: `http://localhost:${APP_PORT}/dashboard`,
    timeout: 180_000,
    reuseExistingServer: false,
    env: { DATABASE_URL: E2E_DATABASE_URL },
  },
});
