import { RouterProvider } from "@tanstack/react-router";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { AppProviders } from "@renderer/shared/providers/app-providers";
import { applyStoredTheme } from "@renderer/ui/lib/theme";
import { router } from "./router";
import "./globals.css";

applyStoredTheme();

const root = document.getElementById("root");
if (!root) throw new Error("index.html has no #root element");

createRoot(root).render(
  <StrictMode>
    <AppProviders>
      <RouterProvider router={router} />
    </AppProviders>
  </StrictMode>,
);
