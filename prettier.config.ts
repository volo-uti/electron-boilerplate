import type { Config } from "prettier";

// Everything not listed here is the Prettier default (semicolons, double quotes, trailing commas).
const config: Config = {
  printWidth: 100,
  plugins: ["prettier-plugin-tailwindcss"],
  tailwindStylesheet: "./src/renderer/app/globals.css",
  tailwindFunctions: ["cn", "cva"],
};

export default config;
