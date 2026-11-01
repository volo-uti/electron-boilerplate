# Principles

The decisions behind this template, with the reason for each and the tool that keeps it true. Rules that no tool checks are kept few on purpose.

## Latest stable only

Dependencies and tools track the latest stable release; no canary, beta or release candidates. Electron ships a major every eight weeks and supports only the latest three, so an old pin quickly becomes an unsupported, unpatched browser. Upgrade cost is paid monthly in small pieces. A dependency with no stable release for 12 months is a reason to revisit the choice, not to freeze it.

Enforced by: `pnpm update-check` (outdated packages, Node LTS, pnpm) and `minimumReleaseAge` in `pnpm-workspace.yaml`.

## One place for versions

Version numbers live in manifests only: `package.json`, `.nvmrc` and the `packageManager` field. Documentation never repeats a number, so nothing can drift.

Enforced by: `scripts/verify` and `scripts/release` pass `.nvmrc` to Docker, the Dockerfile installs the pnpm in `packageManager`, and the Windows workflow reads both files instead of hard-coding versions.

## Processes are boundaries

The main process is Node with full access to the machine; the renderer is web code. The renderer is sandboxed and never imports Electron or Node, the preload exposes only the calls in one typed contract, and code shared by every process imports nothing but zod. A mistake that would give web content Node access then fails the build instead of shipping.

Enforced by: `eslint-plugin-boundaries` in `pnpm lint`, and separate tsconfigs that give the renderer no Node types and the main process no DOM types.

## One typed IPC contract

Every call from the renderer to the main process is a channel in `src/shared/ipc/contract.ts` with a zod schema for its input. The preload builds `window.api` from the contract, and the main process refuses calls from frames outside the app and input that fails the schema. Calls resolve to a `Result` and never reject, so a failure in the main process is handled like any other expected failure.

Enforced by: types derived from the contract, the `handle()` wrapper, lint that limits `window.api` to `ipc-` adapters, and the end-to-end test that checks what the page can see.

## Secure by default

The defaults follow Electron's security checklist: context isolation, sandbox, no Node integration, pages served from an `app://` protocol instead of `file://` with a strict Content-Security-Policy, permission requests denied, navigation and new windows blocked (web links open in the OS browser), and fuses that turn off running as Node, `NODE_OPTIONS`, the inspector and loading code outside the integrity-checked archive. Opening one is a decision a feature makes explicitly.

Enforced by: unit tests for URL and path checks, and `pnpm e2e`, which checks the protocol, the exposed API, the blocked inline script and the blocked window.

## Clean architecture, feature first

Renderer code is grouped by feature, and inside a feature dependencies point inward: `presentation -> application -> domain <- data`. The domain imports no framework, so business rules survive a framework change and can be tested without one. A feature never imports another feature; routes wire them together. The main process holds no business rules: it is the adapter to the operating system.

Enforced by: `eslint-plugin-boundaries` in `pnpm lint`.

## Ports and swappable adapters

Each port has a real adapter (`http-*`, or `ipc-*` for work the main process does) and an in-memory `mock-*` adapter, and configuration picks one. The app therefore runs, and is tested, without a backend.

Enforced by: convention in the `add-feature` skill; the default adapter is the mock, so a fresh clone runs offline.

## Failures are values

Expected failures are returned as a `Result` instead of thrown, also across IPC. Callers must handle them at the type level, and exceptions are left for programmer errors.

Enforced by: the typed `Result`, the `fetch` wrapper and the IPC bridge that never throw, covered by unit and end-to-end tests.

## Stands on its own

A fresh clone runs without environment variables, code generation or sibling repositories. Every environment value has a default and is read through one validated module. Signing and publishing switch on only when their credentials are present. `scripts/init` turns the clone into a project: it renames it, sets the app id, replaces the README and starts a fresh git history.

Enforced by: the zod-validated env module and `pnpm verify` running `pnpm check` from a clean checkout in a Docker container.

## Rules are enforced by tools

Process and layer direction, isolation between features, packages missing from `package.json` and locale key parity are checked by lint and scripts, not described in prose. A rule that cannot be checked must say what breaks when it is ignored; if that cannot be written down, the rule is not kept.

Enforced by: `pnpm lint` and `pnpm check:locales`.

## One gate

`pnpm check` runs format, lint, typecheck, locale parity, index freshness, unit tests and a packaged build. People and agents run the same command, locally or in a clean container, so "done" means the gate passed and its output is the evidence.

Enforced by: the `pre-push` hook (lefthook), which runs `pnpm check`, or `pnpm verify` (the same check in a clean Docker container) on `main` and `develop`. Remote CI runs no tests.

## Discoverable by default

Existing components, helpers and use cases are listed in a generated index in `AGENTS.md`, built from the first sentence of each export's doc comment. Reuse beats rewriting only when the existing code can be found. Raw elements that have a replacement component are blocked, and the lint message names the component to use.

Enforced by: `pnpm check:index` (fails when the index is stale or a doc comment is missing) and ESLint `no-restricted-syntax`.

## Agent neutral

`AGENTS.md` and `.agents/skills/` are the source of truth for coding agents. Tool-specific files exist only where a tool cannot read that source: a skills link and a one-line `CLAUDE.md` that imports `AGENTS.md`. Instructions are written once.

Enforced by: review; nothing else in the repository carries instructions.

## Only the final state

Documents and code describe how things are now. There are no change logs, migration notes or "formerly" sections; history belongs to `git log`.

Enforced by: review.

## Minimal skeleton

A new project should not have to delete anything. Capabilities that many apps need later (forms, API mocking, a generated API client, monitoring, auto-update, settings storage) are not preinstalled; the `add-feature` skill adds them with a default choice when they are first needed.

Enforced by: review.

## Accessible by default

The end-to-end test scans the window with axe in both themes. Accessibility is part of the skeleton, not a later pass.

Enforced by: `pnpm e2e` (Playwright with axe-core).

## Choices

Why the stack looks the way it does. Order of preference: official or first-party, then a stable release within six months, then compatible with the latest Electron, then ecosystem adoption.

| Concern            | Choice                                                                  | Reason                                                                                                                    |
| ------------------ | ----------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| Runtime            | Node from `.nvmrc`, pnpm from `packageManager`, Electron pinned exactly | nvm and CI read the same files; Electron brings its own Node at runtime                                                   |
| Build and package  | Electron Forge with its Vite plugin                                     | the official tool, recommended by Electron's packaging guide; signing, fuses and publishing are first-party plugins       |
| Repository shape   | one package; `nodeLinker: hoisted`                                      | one app needs no workspace; Forge requires a flat `node_modules`, and lint catches imports missing from `package.json`    |
| Language           | TypeScript strict, one tsconfig per process                             | the next major is adopted once typescript-eslint supports it                                                              |
| IPC                | hand-written contract with zod and a generic preload                    | Electron's recommended `invoke`/`handle` with narrow exposure; no library needed for a typed map                          |
| Renderer serving   | `app://` custom protocol                                                | Electron's security checklist advises against `file://`                                                                   |
| Routing            | TanStack Router, code-based routes on hash history                      | type-checked links and params with no code generation; hash history needs no server                                       |
| i18n               | use-intl                                                                | ICU messages and the `useTranslations` API of next-intl, framework-agnostic                                               |
| Server state       | TanStack Query                                                          | the de facto standard                                                                                                     |
| Client state       | Zustand                                                                 | small, no boilerplate; `persist` keeps renderer choices                                                                   |
| Validation         | zod                                                                     | one schema language for HTTP, IPC and env                                                                                 |
| Styling and tokens | Tailwind CSS `@theme` in one theme file; native theme follows           | one source for tokens; `nativeTheme` makes menus and the title bar match                                                  |
| UI components      | shadcn/ui on Base UI in `src/renderer/ui` atoms                         | Base UI is shadcn's default                                                                                               |
| Layer checks       | `eslint-plugin-boundaries`                                              | the only tool that expresses processes, layers and features together                                                      |
| Lint and format    | ESLint, typescript-eslint, React Hooks rules, Prettier                  | the boundary rules exist only for ESLint                                                                                  |
| Unit tests         | Vitest projects for Node and jsdom, Testing Library                     | one runner for both processes                                                                                             |
| End-to-end         | Playwright `_electron` with axe-core                                    | drives the built app; axe runs inside the window because Electron cannot open the extra page `@axe-core/playwright` needs |
| Git hooks          | lefthook                                                                | one binary, and it runs from a subfolder of a larger repository                                                           |
| Release            | from a Mac (macOS, Linux in Docker) plus a Windows runner               | macOS signing needs a Mac; a Windows installer needs Windows; only the cheap Windows build runs remotely                  |
| React Compiler     | on, through Babel in Vite                                               | stable, and the Vite React plugin's documented way                                                                        |
