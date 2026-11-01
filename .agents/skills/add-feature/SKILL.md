---
name: add-feature
description: Add a feature (domain, application, data, presentation) to the renderer, a call to the main process (IPC), or an on-demand capability such as forms, API mocking, an OpenAPI client, error monitoring, auto-update or local storage. Use when building new functionality.
---

# Add a feature

Replace `<f>`. Lint enforces the process and layer rules; `pnpm lint` tells you when an import is wrong.

1. Look up the index in `AGENTS.md` for UI, shared code and use cases you can reuse. If nothing fits, say what you looked for before building it.
2. Create `src/renderer/features/<f>/` with only the layers you need.
3. `domain/` - pure types, zod schemas and the repository **port** (an interface). Example `domain/user.ts`, `domain/user-repository.ts`. No React, Electron or fetch.
4. `application/` - use cases that take a port and return `Result` (`@shared/domain/result`), e.g. `application/get-user.ts`.
5. `data/` - adapters implementing the port:
   - `data/mock-user-repository.ts` - in-memory, the default.
   - `data/http-user-repository.ts` - uses `createHttpClient` from `@shared/data/http-client` with `env.VITE_API_URL`.
   - `data/ipc-<name>.ts` - when the work needs the OS; see the next section.
6. `presentation/` - React components and hooks. Server data uses TanStack Query with keys `[domain, entity, params]`. Text goes through use-intl.
7. Wire it in the route (composition root), `src/renderer/app/routes/<route>.tsx`: pick `mock-` or `http-` by `env.VITE_ADAPTER`, build the use case, pass it to the presentation component as a prop.
8. Add strings to `src/renderer/messages/en.json` and `ko.json` (same keys).
9. Tests next to the code: domain and application as plain Vitest tests with the mock adapter; components with Testing Library.
10. Run `pnpm index`, then `pnpm check`. Run `pnpm e2e` when the change is visible in the window.

## A call to the main process

Use it when the renderer needs something only the main process can do: files, dialogs, notifications, secure storage, a local database. The main process stays an adapter; the use case stays in the feature.

1. Add a channel to `contract` in `src/shared/ipc/contract.ts`, under an area named after the feature: `channel("<area>:<verb>", inputSchema, outputSchema)`. Use `z.void()` when there is no input or output. Keep the schemas narrow: the main process trusts nothing else about the input.
2. Add the handler in `src/main/ipc/<area>.ts` with `handle(contract.<area>.<method>, async (input) => ...)`. Return `ok(value)`, or `err({ kind, message })` for expected failures. Register the area once in `src/main/index.ts` (`register<Area>Handlers(devServerUrl)`). Put Node work that is worth testing in a plain module next to it and unit test that module (`*.test.ts` runs in Node).
3. Implement the port in `src/renderer/features/<f>/data/ipc-<name>.ts`: call `window.api.<area>.<method>(input)`; it already returns a `Result` and never rejects. Only `ipc-` files may read `window.api`.
4. Events from the main process (progress, OS changes): send them with `webContents.send("<area>:<event>", data)` and add a subscribe function to the preload that passes only `data` to the callback and returns an unsubscribe function. Never hand `ipcRenderer` or its event object to the page.
5. A new permission (camera, notifications, ...) is allowed in `src/main/security.ts` for that permission only.
6. Add an e2e case in `e2e/` for the round trip.

## On-demand capabilities

Add each one the first time a feature needs it: install it (`pnpm add`), then use it.

| Need             | Install                                     | Notes                                                                                                                                      |
| ---------------- | ------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| Forms            | `react-hook-form`, `@hookform/resolvers`    | Reuse the feature's zod schema from `domain/` with `zodResolver`                                                                           |
| API mocking      | `msw` (dev)                                 | `msw/node` in unit tests; the app itself runs on `mock-` adapters                                                                          |
| OpenAPI client   | `@hey-api/openapi-ts`                       | Pin the **exact** version (no `^`); generate into the feature's `data/`; wrap the client in an `http-` adapter                             |
| Error monitoring | `@sentry/electron`                          | Initialise it in the main process and the renderer as its guide says; the DSN is `VITE_SENTRY_DSN` with an empty default                   |
| Auto-update      | `update-electron-app`                       | Call it in `src/main/index.ts` once the app is ready; needs a public GitHub repository and signed macOS builds (`docs/release.md`)         |
| Settings store   | `electron-store`                            | Main process only, behind contract channels; small renderer state stays in Zustand `persist`                                               |
| Secrets          | (built in) `safeStorage`                    | Main process only, behind contract channels; never put tokens in `localStorage`                                                            |
| Deep links       | (built in) `app.setAsDefaultProtocolClient` | Register the scheme in `packagerConfig.protocols`; handle `open-url` (macOS) and `second-instance` (Windows, Linux) in `src/main/index.ts` |

Then run `pnpm check`, and `pnpm e2e` for anything that runs in the main process.
