import { defineConfig } from "@playwright/test";

// Tests launch the built app (`pnpm e2e` builds first) one at a time: the app holds a single-instance lock.
export default defineConfig({
  testDir: "./e2e",
  workers: 1,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? [["github"], ["html", { open: "never" }]] : "list",
  use: { trace: "on-first-retry" },
});
