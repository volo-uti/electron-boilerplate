import path from "node:path";

/** Scheme the packaged renderer is served from (`app://renderer/`). */
export const APP_SCHEME = "app";
/** Host of the packaged renderer. */
export const APP_HOST = "renderer";
/** Entry page of the packaged renderer. */
export const APP_ENTRY_URL = `${APP_SCHEME}://${APP_HOST}/index.html`;

const parse = (url: string): URL | null => {
  try {
    return new URL(url);
  } catch {
    return null;
  }
};

/** True when `url` is the app's own page: `app://renderer`, or the dev server during `pnpm dev`. */
export function isAppUrl(url: string, devServerUrl?: string): boolean {
  const parsed = parse(url);
  if (!parsed) return false;
  // Node's URL gives custom schemes an opaque origin, so compare scheme and host instead.
  if (parsed.protocol === `${APP_SCHEME}:` && parsed.host === APP_HOST) return true;
  const dev = devServerUrl ? parse(devServerUrl) : null;
  return dev !== null && parsed.origin === dev.origin;
}

/** True for http and https URLs, the only ones handed to the OS browser. */
export function isWebUrl(url: string): boolean {
  const parsed = parse(url);
  return parsed?.protocol === "https:" || parsed?.protocol === "http:";
}

/** Maps an `app://renderer/...` request to a file under `root`, or `null` when the path would leave `root`. */
export function resolveAsset(root: string, url: string): string | null {
  const parsed = parse(url);
  if (!parsed || parsed.host !== APP_HOST) return null;
  let pathname: string;
  try {
    pathname = decodeURIComponent(parsed.pathname);
  } catch {
    return null;
  }
  const base = path.resolve(root);
  const file = path.resolve(base, `.${pathname === "/" ? "/index.html" : pathname}`);
  return file.startsWith(`${base}${path.sep}`) ? file : null;
}

/**
 * Content-Security-Policy of the app's pages; the dev variant lets Vite's inline refresh script and HMR socket through.
 * A packaged app connects over https only, so an http API (such as the default local one) works in `pnpm dev` only.
 */
export function contentSecurityPolicy(dev: boolean): string {
  return [
    "default-src 'self'",
    dev ? "script-src 'self' 'unsafe-inline'" : "script-src 'self'",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data:",
    "font-src 'self' data:",
    dev
      ? "connect-src 'self' https: http://localhost:* ws://localhost:*"
      : "connect-src 'self' https:",
    "object-src 'none'",
    "base-uri 'none'",
    "form-action 'none'",
    "frame-ancestors 'none'",
  ].join("; ");
}
