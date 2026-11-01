import type { z } from "zod";
import type { AppError } from "../domain/errors";
import { err, ok, type Result } from "../domain/result";

/** Options for `createHttpClient`: base URL, optional `fetch` and default headers. */
export type HttpClientOptions = {
  baseUrl: string;
  fetch?: typeof fetch;
  headers?: Record<string, string>;
};

/** Per-request options: method, JSON body, the zod `schema` for the response and an abort signal. */
export type RequestOptions<S extends z.ZodType> = {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: unknown;
  schema: S;
  signal?: AbortSignal;
};

/** Thin `fetch` wrapper: never throws, validates the response body, returns a `Result`. */
export function createHttpClient({
  baseUrl,
  fetch: fetchImpl = fetch,
  headers,
}: HttpClientOptions) {
  async function request<S extends z.ZodType>(
    path: string,
    { method = "GET", body, schema, signal }: RequestOptions<S>,
  ): Promise<Result<z.infer<S>, AppError>> {
    let response: Response;
    try {
      response = await fetchImpl(new URL(path, baseUrl), {
        method,
        signal,
        headers: {
          accept: "application/json",
          ...(body !== undefined ? { "content-type": "application/json" } : {}),
          ...headers,
        },
        body: body === undefined ? undefined : JSON.stringify(body),
      });
    } catch (cause) {
      return err({
        kind: "network",
        message: cause instanceof Error ? cause.message : "Network error",
      });
    }

    if (!response.ok) {
      const kind = response.status === 404 ? "not-found" : "http";
      return err(
        kind === "http"
          ? { kind, status: response.status, message: response.statusText }
          : { kind, message: response.statusText },
      );
    }

    let json: unknown;
    try {
      json = await response.json();
    } catch {
      return err({ kind: "parse", message: "Response is not valid JSON" });
    }
    const parsed = schema.safeParse(json);
    return parsed.success ? ok(parsed.data) : err({ kind: "parse", message: parsed.error.message });
  }

  return { request };
}

/** The client returned by `createHttpClient`. */
export type HttpClient = ReturnType<typeof createHttpClient>;
