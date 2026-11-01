import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import type { Page } from "@playwright/test";
import type { AxeResults } from "axe-core";

const axeSource = readFileSync(createRequire(import.meta.url).resolve("axe-core"), "utf8");

/**
 * Runs axe-core inside the window and returns its violations. `@axe-core/playwright` cannot be used:
 * it opens a blank page to merge results, and Electron does not let Playwright create pages.
 */
export async function axeViolations(page: Page): Promise<AxeResults["violations"]> {
  await page.evaluate(axeSource);
  return page.evaluate(async () => {
    const { axe } = window as unknown as {
      axe: { run: (context: Document) => Promise<AxeResults> };
    };
    return (await axe.run(document)).violations;
  });
}
