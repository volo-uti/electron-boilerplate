import { z } from "zod";
import type { AppError } from "../domain/errors";
import type { Result } from "../domain/result";

/** One IPC call: a unique channel name, the input the main process validates and the output it returns. */
export type Channel<I extends z.ZodType = z.ZodType, O extends z.ZodType = z.ZodType> = {
  readonly name: string;
  readonly input: I;
  readonly output: O;
};

/** Declares one IPC call for the contract; use `z.void()` for a call without input or output. */
export const channel = <I extends z.ZodType, O extends z.ZodType>(
  name: string,
  input: I,
  output: O,
): Channel<I, O> => ({ name, input, output });

/** Theme the native UI follows: `system` tracks the OS setting. */
export const themeSource = z.enum(["system", "light", "dark"]);
/** Union of the theme sources. */
export type ThemeSource = z.infer<typeof themeSource>;

/**
 * Every call the renderer can make to the main process, grouped by area. The preload exposes
 * exactly these as `window.api.<area>.<method>`, and the main process registers one handler each.
 */
export const contract = {
  theme: {
    setSource: channel("theme:set-source", themeSource, z.void()),
  },
} as const;

type Call<C> =
  C extends Channel<infer I, infer O>
    ? (
        ...input: undefined extends z.input<I> ? [] : [z.input<I>]
      ) => Promise<Result<z.output<O>, AppError>>
    : never;

/** The API on `window.api`: every call resolves to a `Result` and never rejects. */
export type Api = {
  readonly [A in keyof typeof contract]: {
    readonly [M in keyof (typeof contract)[A]]: Call<(typeof contract)[A][M]>;
  };
};
