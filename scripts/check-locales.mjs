#!/usr/bin/env node
// Every locale file in src/renderer/messages must have the same key set.
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

const dir = "src/renderer/messages";

const flatten = (value, prefix = "") =>
  Object.entries(value).flatMap(([key, child]) =>
    child !== null && typeof child === "object"
      ? flatten(child, `${prefix}${key}.`)
      : [`${prefix}${key}`],
  );

const files = readdirSync(dir).filter((file) => file.endsWith(".json"));
const keys = new Map(
  files.map((file) => [file, new Set(flatten(JSON.parse(readFileSync(join(dir, file), "utf8"))))]),
);
const all = new Set([...keys.values()].flatMap((set) => [...set]));

let failed = false;
for (const [file, set] of keys) {
  const missing = [...all].filter((key) => !set.has(key));
  if (missing.length > 0) {
    failed = true;
    console.error(`${join(dir, file)} is missing: ${missing.join(", ")}`);
  }
}

if (failed) process.exit(1);
console.log("locales: all message files have the same keys");
