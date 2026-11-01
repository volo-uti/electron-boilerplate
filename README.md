# Electron Boilerplate

A template for Electron desktop apps. Process boundaries, layers and security defaults are enforced by lint and tests, so the app stays tidy and safe as it grows.

- Electron with Electron Forge and Vite, one package: main process, preload, React renderer
- React with the React Compiler, TanStack Router on hash history, TypeScript strict
- use-intl (English and Korean), with the first language taken from the OS
- Tailwind CSS 4 with one theme file, shadcn/ui on Base UI, a light/dark toggle that native UI follows
- TanStack Query, Zustand, zod, a `Result` type and one typed IPC contract that the main process validates
- Secure defaults: sandboxed renderer, context isolation, an `app://` protocol with a Content-Security-Policy, Electron fuses
- ESLint with `eslint-plugin-boundaries` (processes and layers), Prettier
- Vitest in Node and jsdom, Playwright driving the built app with axe, lefthook
- Releases from a Mac (macOS and Linux installers) plus one GitHub Actions job for the Windows installer
- Agent-ready: `AGENTS.md` and skills under `.agents/skills`

## Use it

```bash
git clone https://github.com/volo-uti/electron-boilerplate my-app
cd my-app
scripts/init --name my-app --org com.example   # app id com.example.my-app
pnpm install
pnpm dev
```

Run `nvm install` (or any tool that reads `.nvmrc`) before `pnpm install`. pnpm itself is pinned by the `packageManager` field and switches automatically — this needs a global pnpm 12 or newer, because pnpm 10 cannot switch to pnpm 12's native binary (it fails with `ENOEXEC`). Electron downloads its binary the first time it runs.

## Commands

| Command             | What it does                                                                            |
| ------------------- | --------------------------------------------------------------------------------------- |
| `pnpm dev`          | Run the app; the renderer reloads on save                                               |
| `pnpm check`        | The gate: format, lint, typecheck, locales, unit tests, packaged build                  |
| `pnpm verify`       | `pnpm check` in a clean Docker container (needs Docker)                                 |
| `pnpm e2e`          | Build, then drive the app with Playwright and scan it with axe (Linux needs `xvfb-run`) |
| `pnpm release`      | Release from a Mac; see [docs/release.md](docs/release.md)                              |
| `pnpm update-check` | Outdated dependencies (Electron included), Node LTS, pnpm                               |

## Platforms and releases

The app runs on macOS, Windows and Linux. The scripts are bash: Windows developers run them in WSL2, and `pnpm release` needs macOS because only a Mac can build and sign the macOS app. Tests run locally: `pnpm verify` runs the gate in a clean Linux container, and the `pre-push` hook uses it on `main` and `develop`. GitHub Actions runs no tests; it only builds the Windows installer when a version tag is pushed (`.github/workflows/release-windows.yml`). Release start and finish are posted to Slack when `SLACK_BOT_TOKEN` and `SLACK_CICD_CHANNEL` are set; without them the notification is skipped.

## Structure

```
src/main/       Main process: lifecycle, window, app:// protocol, IPC handlers
src/preload/    The bridge that exposes the IPC contract as window.api
src/renderer/   React app: app (routes), features, shared, ui (design system and theme), messages
src/shared/     Code every process uses: Result, errors, http client, IPC contract, locales
e2e/            Playwright tests against the built app
scripts/        init, release, update-check, verify, check-locales, agent-index
```

The renderer cannot reach Node or Electron; it talks to the main process only through the calls listed in `src/shared/ipc/contract.ts`. Inside a renderer feature the dependency direction is `presentation -> application -> domain <- data`; features never import each other. See `AGENTS.md`.

## Contributing

Issues and pull requests are welcome. Read [CONTRIBUTING.md](CONTRIBUTING.md) first; everyone taking part follows the [Code of Conduct](CODE_OF_CONDUCT.md).

## Security

Report vulnerabilities privately, as described in [SECURITY.md](SECURITY.md).

## Principles

The reasons behind the structure and the stack are in [PRINCIPLES.md](PRINCIPLES.md).

## License

MIT, see [LICENSE](LICENSE).
