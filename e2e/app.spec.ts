import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import {
  _electron as electron,
  expect,
  test as base,
  type ElectronApplication,
  type Page,
} from "@playwright/test";
import { axeViolations } from "./axe";

// Each test starts the built app in English with its own empty profile, so stored choices never leak between tests.
const test = base.extend<{ app: ElectronApplication; page: Page }>({
  app: async ({}, use) => {
    const profile = mkdtempSync(path.join(tmpdir(), "e2e-profile-"));
    const app = await electron.launch({
      args: [".", `--user-data-dir=${profile}`, "--lang=en-US"],
    });
    await use(app);
    await app.close();
    rmSync(profile, { recursive: true, force: true });
  },
  page: async ({ app }, use) => {
    const page = await app.firstWindow();
    await page.emulateMedia({ colorScheme: "light" });
    await use(page);
  },
});

test("home renders from the app protocol", async ({ page }) => {
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  expect(page.url()).toMatch(/^app:\/\/renderer\/index\.html/);
});

test("theme toggle switches the html class, persists and drives the native theme", async ({
  app,
  page,
}) => {
  const html = page.locator("html");
  await expect(html).not.toHaveClass(/dark/);
  await page.getByRole("button", { name: "Toggle theme" }).click();
  await expect(html).toHaveClass(/dark/);
  await expect.poll(() => app.evaluate(({ nativeTheme }) => nativeTheme.themeSource)).toBe("dark");
  await page.reload();
  await expect(html).toHaveClass(/dark/);
});

test("the page sees only the contract API, no Node and no new windows", async ({ app, page }) => {
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  const exposed = await page.evaluate(() => ({
    api: Object.keys((window as unknown as { api: object }).api),
    require: typeof (globalThis as { require?: unknown }).require,
    process: typeof (globalThis as { process?: unknown }).process,
    opened: window.open("app://renderer/index.html") !== null,
    // The Content-Security-Policy blocks inline scripts.
    inlineScript: (() => {
      const script = document.createElement("script");
      script.textContent = "document.body.dataset.inline = 'ran'";
      document.head.append(script);
      return document.body.dataset.inline === "ran";
    })(),
  }));
  expect(exposed).toEqual({
    api: ["theme"],
    require: "undefined",
    process: "undefined",
    opened: false,
    inlineScript: false,
  });
  expect(app.windows()).toHaveLength(1);
});

test("has no axe violations in both themes", async ({ page }) => {
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  expect(await axeViolations(page)).toEqual([]);
  await page.getByRole("button", { name: "Toggle theme" }).click();
  await expect(page.locator("html")).toHaveClass(/dark/);
  expect(await axeViolations(page)).toEqual([]);
});
