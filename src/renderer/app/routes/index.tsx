import { createRoute } from "@tanstack/react-router";
import { HomePage } from "@renderer/features/home/presentation/home-page";
import { rootRoute } from "./root";

/** `/`: the home page. */
export const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: HomePage,
});
