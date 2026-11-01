---
name: update-deps
description: Monthly dependency routine - report what is outdated (Electron included), update, verify with the gate and the end-to-end tests, and report updated, blocked and REVISIT packages.
---

# Update dependencies

1. Run `pnpm update-check`. It lists outdated dependencies, the latest Node LTS and pnpm against `.nvmrc` and `packageManager`, and marks `REVISIT` for any direct dependency whose latest release is over 12 months old.
2. Update with `pnpm update --latest`. Versions live in `package.json`; check the diff there. Exact pins stay exact: set Electron with `pnpm add --save-dev --save-exact electron@<version>` and read Electron's breaking changes for every major you cross; TypeScript moves when typescript-eslint supports the new version.
3. If Node or pnpm moved, edit `.nvmrc` or `packageManager` in `package.json`.
4. Run `pnpm install` then `pnpm check`. If a package breaks the gate, revert only that package and record it as blocked with the error. If install fails on an unreviewed build script, decide it in `allowBuilds` in `pnpm-workspace.yaml`.
5. Run `pnpm e2e` every time: Electron, Forge, Vite and React changes often show up only in the running app.
6. Report three lists: **updated** (name, old to new), **blocked** (name, why), **REVISIT** (name, last release date, suggested action: keep, replace or drop).
