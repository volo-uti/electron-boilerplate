import { defineConfig } from "vite";

// Forge adds the entry, the CommonJS output in .vite/build and the Node and Electron externals.
export default defineConfig({ resolve: { tsconfigPaths: true } });
