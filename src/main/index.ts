import { app, BrowserWindow } from "electron";
import path from "node:path";
import { registerThemeHandlers } from "./ipc/theme";
import { registerAppScheme, serveRenderer } from "./protocol";
import { applyDevContentSecurityPolicy, denyPermissions } from "./security";
import { handleSquirrelEvent } from "./squirrel";
import { APP_ENTRY_URL } from "./trust";
import { createMainWindow } from "./window";

// Composition root of the main process: app lifecycle, the renderer protocol, IPC handlers, the window.
// Forge defines the dev server URL during `pnpm dev` and leaves it undefined in a build.
const devServerUrl: string | undefined = MAIN_WINDOW_VITE_DEV_SERVER_URL;

if (handleSquirrelEvent() || !app.requestSingleInstanceLock()) {
  app.quit();
} else {
  registerAppScheme();

  app.on("second-instance", () => {
    const [window] = BrowserWindow.getAllWindows();
    if (!window) return;
    if (window.isMinimized()) window.restore();
    window.focus();
  });
  app.on("window-all-closed", () => {
    if (process.platform !== "darwin") app.quit();
  });

  void app.whenReady().then(() => {
    denyPermissions();
    registerThemeHandlers(devServerUrl);
    if (devServerUrl) applyDevContentSecurityPolicy(devServerUrl);
    else serveRenderer(path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}`));

    const open = () => createMainWindow(devServerUrl ?? APP_ENTRY_URL, devServerUrl);
    open();
    app.on("activate", () => {
      if (BrowserWindow.getAllWindows().length === 0) open();
    });
  });
}
