import { describe, expect, it } from "vitest";
import { z } from "zod";
import { createHttpClient } from "./http-client";

const json = (body: unknown, status = 200) =>
  Promise.resolve(new Response(JSON.stringify(body), { status }));

describe("createHttpClient", () => {
  const schema = z.object({ id: z.number() });

  it("returns validated data", async () => {
    const client = createHttpClient({ baseUrl: "http://x.test", fetch: () => json({ id: 1 }) });
    expect(await client.request("/a", { schema })).toEqual({ ok: true, value: { id: 1 } });
  });

  it("returns a parse error for an unexpected body", async () => {
    const client = createHttpClient({ baseUrl: "http://x.test", fetch: () => json({ id: "1" }) });
    const result = await client.request("/a", { schema });
    expect(!result.ok && result.error.kind).toBe("parse");
  });

  it("sends every defined body as JSON, including falsy ones", async () => {
    for (const body of [0, false, "", null, { a: 1 }]) {
      let init: RequestInit | undefined;
      const client = createHttpClient({
        baseUrl: "http://x.test",
        fetch: (_url, requestInit) => {
          init = requestInit;
          return json({ id: 1 });
        },
      });
      await client.request("/a", { method: "POST", body, schema });
      expect(init?.body).toBe(JSON.stringify(body));
      expect(init?.headers).toMatchObject({ "content-type": "application/json" });
    }
  });

  it("sends no body or content type when none is given", async () => {
    let init: RequestInit | undefined;
    const client = createHttpClient({
      baseUrl: "http://x.test",
      fetch: (_url, requestInit) => {
        init = requestInit;
        return json({ id: 1 });
      },
    });
    await client.request("/a", { schema });
    expect(init?.body).toBeUndefined();
    expect(init?.headers).not.toHaveProperty("content-type");
  });

  it("maps statuses and network failures", async () => {
    const missing = createHttpClient({ baseUrl: "http://x.test", fetch: () => json({}, 404) });
    const result = await missing.request("/a", { schema });
    expect(!result.ok && result.error.kind).toBe("not-found");

    const down = createHttpClient({
      baseUrl: "http://x.test",
      fetch: () => Promise.reject(new Error("down")),
    });
    const failed = await down.request("/a", { schema });
    expect(!failed.ok && failed.error).toEqual({ kind: "network", message: "down" });
  });
});
