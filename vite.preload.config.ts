import { defineConfig } from "vite";

// Forge bundles the preload into one CommonJS file: a sandboxed preload can only `require("electron")`.
export default defineConfig({ resolve: { tsconfigPaths: true } });
