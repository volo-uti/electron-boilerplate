import type { ReactNode } from "react";
import { ThemeProvider } from "@renderer/ui/lib/theme";
import { setNativeTheme } from "../data/ipc-native-theme";
import { I18nProvider } from "../i18n/i18n-provider";
import { QueryProvider } from "./query-provider";

/** Wraps the app in the intl, theme and query providers; native UI follows the theme; mounted once by the entry. */
export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <I18nProvider>
      <ThemeProvider onThemeChange={setNativeTheme}>
        <QueryProvider>{children}</QueryProvider>
      </ThemeProvider>
    </I18nProvider>
  );
}
