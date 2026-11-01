import { nativeTheme } from "electron";
import { ok } from "@shared/domain/result";
import { contract } from "@shared/ipc/contract";
import { handle } from "./handle";

/** Lets the renderer choose the theme native UI follows: menus, title bar and `prefers-color-scheme`. */
export function registerThemeHandlers(devServerUrl?: string) {
  handle(
    contract.theme.setSource,
    (source) => {
      nativeTheme.themeSource = source;
      return ok(undefined);
    },
    devServerUrl,
  );
}
