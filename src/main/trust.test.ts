import path from "node:path";
import { describe, expect, it } from "vitest";
import { contentSecurityPolicy, isAppUrl, isWebUrl, resolveAsset } from "./trust";

describe("isAppUrl", () => {
  it("accepts the app's own pages", () => {
    expect(isAppUrl("app://renderer/index.html")).toBe(true);
    expect(isAppUrl("http://localhost:5173/#/x", "http://localhost:5173/")).toBe(true);
  });

  it("rejects everything else", () => {
    expect(isAppUrl("app://other/index.html")).toBe(false);
    expect(isAppUrl("https://example.com/")).toBe(false);
    expect(isAppUrl("http://localhost:5173/")).toBe(false);
    expect(isAppUrl("http://localhost:9999/", "http://localhost:5173/")).toBe(false);
    expect(isAppUrl("file:///etc/passwd")).toBe(false);
    expect(isAppUrl("not a url")).toBe(false);
  });
});

describe("isWebUrl", () => {
  it("accepts only http and https", () => {
    expect(isWebUrl("https://example.com")).toBe(true);
    expect(isWebUrl("http://example.com")).toBe(true);
    expect(isWebUrl("file:///etc/passwd")).toBe(false);
    expect(isWebUrl("javascript:alert(1)")).toBe(false);
  });
});

describe("resolveAsset", () => {
  const root = path.resolve("/srv/renderer");

  it("maps paths under the root and serves index.html for /", () => {
    expect(resolveAsset(root, "app://renderer/")).toBe(path.join(root, "index.html"));
    expect(resolveAsset(root, "app://renderer/assets/a.js?v=1")).toBe(
      path.join(root, "assets/a.js"),
    );
  });

  it("refuses paths that leave the root and other hosts", () => {
    // The URL parser already folds dot segments, even encoded ones, back under the root.
    expect(resolveAsset(root, "app://renderer/%2e%2e/secret")).toBe(path.join(root, "secret"));
    expect(resolveAsset(root, "app://renderer/..%2f..%2fsecret")).toBeNull();
    expect(resolveAsset(root, "app://renderer/%E0%A4%A")).toBeNull();
    expect(resolveAsset(root, "app://other/index.html")).toBeNull();
  });
});

describe("contentSecurityPolicy", () => {
  it("allows inline scripts only in development", () => {
    expect(contentSecurityPolicy(false)).toContain("script-src 'self';");
    expect(contentSecurityPolicy(true)).toContain("script-src 'self' 'unsafe-inline'");
  });
});
