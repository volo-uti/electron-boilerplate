import { resolve } from "node:path";
import babel from "@rolldown/plugin-babel";
import tailwindcss from "@tailwindcss/vite";
import react, { reactCompilerPreset } from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// The renderer lives in src/renderer; its build goes where Forge's main process looks for it.
export default defineConfig({
  root: resolve(import.meta.dirname, "src/renderer"),
  envDir: import.meta.dirname,
  build: { outDir: resolve(import.meta.dirname, ".vite/renderer/main_window"), emptyOutDir: true },
  plugins: [react(), babel({ presets: [reactCompilerPreset()] }), tailwindcss()],
  resolve: { tsconfigPaths: true },
});
