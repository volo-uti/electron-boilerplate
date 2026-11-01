/** Expected failures are values, not exceptions. Throw only for programmer errors. */
export type Result<T, E = Error> = { ok: true; value: T } | { ok: false; error: E };

/** Wraps a value in a successful `Result`. */
export const ok = <T>(value: T): Result<T, never> => ({ ok: true, value });

/** Wraps an error in a failed `Result`. */
export const err = <E>(error: E): Result<never, E> => ({ ok: false, error });

/** Transforms the value of a successful `Result` and passes a failure through. */
export function map<T, U, E>(result: Result<T, E>, fn: (value: T) => U): Result<U, E> {
  return result.ok ? ok(fn(result.value)) : result;
}

/** Returns the value of a successful `Result`, or `fallback` on failure. */
export function unwrapOr<T, E>(result: Result<T, E>, fallback: T): T {
  return result.ok ? result.value : fallback;
}
