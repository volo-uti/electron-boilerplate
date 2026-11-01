import { z } from "zod";

/**
 * Every value has a default: the app runs with no environment variables.
 * Vite inlines `VITE_*` values at build time, so they are read as literal `import.meta.env.NAME`.
 */
const schema = z.object({
  /** A packaged app may only connect over https (see the Content-Security-Policy in src/main/trust.ts). */
  VITE_API_URL: z.url().default("http://localhost:4000"),
  /** `mock` serves in-memory adapters; `http` talks to VITE_API_URL. */
  VITE_ADAPTER: z.enum(["mock", "http"]).default("mock"),
});

/** Parsed environment values of the renderer. */
export type Env = z.infer<typeof schema>;

/** Validates a raw env record against the schema and applies defaults. */
export function parseEnv(source: Record<string, string | undefined>): Env {
  return schema.parse({
    VITE_API_URL: source.VITE_API_URL || undefined,
    VITE_ADAPTER: source.VITE_ADAPTER || undefined,
  });
}

/** The renderer's environment, inlined by Vite; import this instead of reading `import.meta.env`. */
export const env: Env = parseEnv({
  VITE_API_URL: import.meta.env.VITE_API_URL,
  VITE_ADAPTER: import.meta.env.VITE_ADAPTER,
});
