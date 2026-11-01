import { createHashHistory, createRouter } from "@tanstack/react-router";
import { indexRoute } from "./routes/index";
import { rootRoute } from "./routes/root";

const routeTree = rootRoute.addChildren([indexRoute]);

/** The app's router: code-based routes on hash history, so a reload keeps the page without a server. */
export const router = createRouter({ routeTree, history: createHashHistory() });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}
