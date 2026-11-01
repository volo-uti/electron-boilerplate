import js from "@eslint/js";
import { createTypeScriptImportResolver } from "eslint-import-resolver-typescript";
import boundaries from "eslint-plugin-boundaries";
import importX from "eslint-plugin-import-x";
import reactHooks from "eslint-plugin-react-hooks";
import { defineConfig, globalIgnores } from "eslint/config";
import globals from "globals";
import tseslint from "typescript-eslint";

// Raw elements that have a replacement. A new atom adds one line here. A key is a tag name, or a full
// `JSXOpeningElement…` selector as UI packages ship them, so a package's map can be spread in.
const rawElementReplacements = {
  button: "Use Button from @renderer/ui/atoms/button (see the index in AGENTS.md).",
};

const element = (type, pattern, capture) => ({ type, pattern, capture, partialMatch: false });

// Processes first (main, preload, renderer, process-neutral shared), then the renderer's layers.
// Features are matched generically (`features/*`), so a new feature needs no change here.
const elements = [
  element("main", "src/main"),
  element("preload", "src/preload"),
  element("shared", "src/shared"),
  element("domain", "src/renderer/features/*/domain", ["feature"]),
  element("application", "src/renderer/features/*/application", ["feature"]),
  element("data", "src/renderer/features/*/data", ["feature"]),
  element("presentation", "src/renderer/features/*/presentation", ["feature"]),
  element("routes", "src/renderer/app"),
  element("renderer-shared", "src/renderer/shared"),
  element("ui", "src/renderer/ui"),
  element("messages", "src/renderer/messages"),
];
const renderer = [
  "domain",
  "application",
  "data",
  "presentation",
  "routes",
  "renderer-shared",
  "ui",
];

const sameFeature = (type) => ({
  element: { type, captured: { feature: "{{ from.element.captured.feature }}" } },
});
const anyExternal = { module: { origin: ["external", "core"] } };
const only = (source) => ({ module: { origin: ["external", "core"], source: `!${source}` } });

const policies = [
  // A file may always import its own element.
  { allow: { dependency: { relationship: { to: "internal" } } } },
  // External packages and Node built-ins are open by default; the rules below narrow them.
  { allow: { to: anyExternal } },
  // Processes: main and preload use shared code; the sandboxed renderer never reaches Node or Electron.
  {
    from: { element: { type: ["main", "preload"] } },
    allow: { to: { element: { type: "shared" } } },
  },
  { from: { element: { type: "preload" } }, disallow: { to: only("electron") } },
  { from: { element: { type: "shared" } }, disallow: { to: only("zod") } },
  {
    from: { element: { type: renderer } },
    disallow: { to: [{ module: { origin: "core" } }, { module: { source: "electron{,/**}" } }] },
  },
  { from: { element: { type: renderer } }, allow: { to: { element: { type: "shared" } } } },
  // domain: only zod; tests may use their runner.
  { from: { element: { type: "domain" } }, disallow: { to: only("zod") } },
  { from: { file: { categories: "test" } }, allow: { to: anyExternal } },
  // presentation → application → domain ← data (within one feature).
  { from: { element: { type: "application" } }, allow: { to: sameFeature("domain") } },
  {
    from: { element: { type: "data" } },
    allow: { to: [sameFeature("domain"), { element: { type: "renderer-shared" } }] },
  },
  {
    from: { element: { type: "presentation" } },
    allow: {
      to: [
        sameFeature("application"),
        sameFeature("domain"),
        { element: { type: ["renderer-shared", "ui"] } },
      ],
    },
  },
  // Routes compose features (composition root) and use shared code.
  {
    from: { element: { type: "routes" } },
    allow: {
      to: {
        element: {
          type: ["domain", "application", "data", "presentation", "renderer-shared", "ui"],
        },
      },
    },
  },
  {
    from: { element: { type: "renderer-shared" } },
    allow: { to: { element: { type: ["ui", "messages"] } } },
  },
  { from: { file: { categories: "test" } }, allow: { to: { element: { type: "messages" } } } },
];

export default defineConfig([
  globalIgnores([
    "**/node_modules/**",
    ".vite/**",
    "out/**",
    "coverage/**",
    "playwright-report/**",
    "test-results/**",
  ]),
  js.configs.recommended,
  ...tseslint.configs.recommended,
  { files: ["src/renderer/**/*.{ts,tsx}"], ...reactHooks.configs.flat["recommended-latest"] },
  {
    languageOptions: { globals: { ...globals.node } },
    settings: {
      "import/resolver": {
        typescript: { alwaysTryTypes: true, project: "tsconfig.json" },
      },
      "import-x/resolver-next": [
        createTypeScriptImportResolver({ alwaysTryTypes: true, project: "tsconfig.json" }),
      ],
      "boundaries/elements": elements,
      "boundaries/files": [
        { category: "test", pattern: "**/*.test.{ts,tsx}" },
        { category: "config", pattern: "*.config.{ts,mjs}" },
      ],
    },
    plugins: { boundaries, "import-x": importX },
    rules: {
      "boundaries/dependencies": [
        "error",
        {
          default: "disallow",
          checkAllOrigins: true,
          message:
            "Import not allowed by the process and layer rules: {{ from.element.types }} -> {{ to.element.types }}{{ to.module.source }}",
          policies,
        },
      ],
      // node_modules is flat for Forge, so a package not in package.json would still resolve.
      "import-x/no-extraneous-dependencies": "error",
      "@typescript-eslint/consistent-type-imports": "error",
      "@typescript-eslint/no-unused-vars": ["error", { argsIgnorePattern: "^_" }],
      // Open gaps in a UI package, written by hand until the package gets them; listed, never failed.
      "no-warning-comments": ["warn", { terms: ["todo(library:"], location: "start" }],
    },
  },
  {
    files: ["src/renderer/**/*.{ts,tsx}"],
    languageOptions: { globals: { ...globals.browser } },
  },
  // A source file outside the folders above escapes every rule, so it is an error itself.
  { files: ["src/**/*.{ts,tsx}"], rules: { "boundaries/no-unknown-files": "error" } },
  // Playwright fixtures must destructure their first argument, even when they use nothing from it.
  { files: ["e2e/**/*.ts"], rules: { "no-empty-pattern": "off" } },
  {
    files: ["src/renderer/**/*.{ts,tsx}"],
    ignores: ["src/renderer/**/data/ipc-*.ts"],
    rules: {
      "no-restricted-properties": [
        "error",
        {
          object: "window",
          property: "api",
          message: "Call the main process only from an ipc- adapter in a data/ folder.",
        },
      ],
    },
  },
  {
    files: ["src/renderer/**/*.{ts,tsx}"],
    ignores: ["src/renderer/ui/**", "src/renderer/shared/env.ts"],
    rules: {
      "no-restricted-syntax": [
        "error",
        {
          selector: "MemberExpression[object.type='MetaProperty'][property.name='env']",
          message: "Read environment values through env from @renderer/shared/env.",
        },
        ...Object.entries(rawElementReplacements).map(([tag, message]) => ({
          selector: tag.startsWith("JSXOpeningElement")
            ? tag
            : `JSXOpeningElement[name.name='${tag}']`,
          message,
        })),
      ],
    },
  },
  {
    files: ["src/renderer/ui/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-syntax": [
        "error",
        {
          selector: "MemberExpression[object.type='MetaProperty'][property.name='env']",
          message: "UI components take values as props; they do not read the environment.",
        },
      ],
    },
  },
]);
