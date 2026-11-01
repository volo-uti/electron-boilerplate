import { describe, expect, it } from "vitest";
import { matchLocale } from "./locales";

describe("matchLocale", () => {
  it("takes the first supported language, ignoring the region", () => {
    expect(matchLocale(["fr-FR", "ko-KR", "en-US"])).toBe("ko");
  });

  it("falls back to the default", () => {
    expect(matchLocale(["fr", "de"])).toBe("en");
    expect(matchLocale([])).toBe("en");
  });
});
