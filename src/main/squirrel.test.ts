import { spawn } from "node:child_process";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { handleSquirrelEvent } from "./squirrel";

vi.mock("node:child_process", () => ({ spawn: vi.fn(() => ({ on: vi.fn() })) }));

const { platform, argv } = process;
const start = (os: NodeJS.Platform, flag?: string) => {
  Object.defineProperty(process, "platform", { value: os });
  process.argv = flag ? ["app.exe", flag] : ["app.exe"];
};

describe("handleSquirrelEvent", () => {
  beforeEach(() => vi.mocked(spawn).mockClear());
  afterEach(() => {
    Object.defineProperty(process, "platform", { value: platform });
    process.argv = argv;
  });

  it("creates shortcuts on install and quits", () => {
    start("win32", "--squirrel-install");
    expect(handleSquirrelEvent()).toBe(true);
    expect(vi.mocked(spawn).mock.calls[0]?.[1]).toEqual(["--createShortcut=node"]);
  });

  it("quits on obsolete without touching shortcuts", () => {
    start("win32", "--squirrel-obsolete");
    expect(handleSquirrelEvent()).toBe(true);
    expect(spawn).not.toHaveBeenCalled();
  });

  it("starts normally on the first run after install, without a flag and off Windows", () => {
    start("win32", "--squirrel-firstrun");
    expect(handleSquirrelEvent()).toBe(false);
    start("win32");
    expect(handleSquirrelEvent()).toBe(false);
    start("darwin", "--squirrel-install");
    expect(handleSquirrelEvent()).toBe(false);
  });
});
