import { describe, expect, it } from "vitest";
import { err, map, ok, unwrapOr } from "./result";

describe("Result", () => {
  it("maps only success values", () => {
    expect(map(ok(2), (n) => n * 2)).toEqual(ok(4));
    const failure = err("boom");
    expect(map(failure, (n: number) => n * 2)).toBe(failure);
  });

  it("falls back on failure", () => {
    expect(unwrapOr(ok(1), 0)).toBe(1);
    expect(unwrapOr(err("boom"), 0)).toBe(0);
  });
});
