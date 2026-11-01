---
name: add-route
description: Add a page to the renderer's router (TanStack Router, code-based routes on hash history). Use when a new screen is needed.
---

# Add a route

Routes live in `src/renderer/app/routes/` and stay thin: they compose features, they hold no business logic.

1. Create `src/renderer/app/routes/<name>.tsx` and export `<name>Route = createRoute({ getParentRoute: () => rootRoute, path: "/<segment>", component })`. Path params: `path: "/items/$id"`, read them with `<name>Route.useParams()`. Search params: `validateSearch` with a zod schema.
2. Add the route to `routeTree` in `src/renderer/app/router.ts`.
3. Render a component from `features/<f>/presentation/`. If it needs data, build the adapter and use case in the route (see `add-feature`, step 7).
4. Links use `Link` from `@tanstack/react-router` (`<Link to="/<segment>">`). Paths and params are typed against the route tree, so `pnpm typecheck` fails on a wrong link.
5. Add the page's strings to `src/renderer/messages/en.json` and `ko.json`.
6. The root route already renders the not-found and error pages; add `errorComponent` or `pendingComponent` to a route only if that page needs its own.
7. Run `pnpm check`; add an e2e case in `e2e/` for user-visible flows (navigate by clicking links: the address is a hash on `app://renderer/index.html`).
