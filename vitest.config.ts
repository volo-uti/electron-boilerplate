import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

// Main-process and shared code run in Node; renderer code runs in jsdom with Testing Library.
export default defineConfig({
  resolve: { tsconfigPaths: true },
  test: {
    passWithNoTests: true,
    projects: [
      {
        extends: true,
        test: {
          name: "node",
          environment: "node",
          include: ["src/{main,preload,shared}/**/*.test.ts"],
        },
      },
      {
        extends: true,
        plugins: [react()],
        test: {
          name: "renderer",
          environment: "jsdom",
          include: ["src/renderer/**/*.test.{ts,tsx}"],
          setupFiles: ["./vitest.setup.ts"],
        },
      },
    ],
  },
});
