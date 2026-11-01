import { BrowserWindow, shell } from "electron";
import path from "node:path";
import { isAppUrl, isWebUrl } from "./trust";

/** Opens the main window with locked-down web preferences and loads `entryUrl`. */
export function createMainWindow(entryUrl: string, devServerUrl?: string) {
  const window = new BrowserWindow({
    width: 1024,
    height: 720,
    show: false,
    webPreferences: {
      preload: path.join(__dirname, "preload.cjs"),
      contextIsolation: true,
      sandbox: true,
      nodeIntegration: false,
    },
  });
  window.once("ready-to-show", () => window.show());

  // No new windows inside the app; web links open in the OS browser instead.
  window.webContents.setWindowOpenHandler(({ url }) => {
    if (isWebUrl(url)) void shell.openExternal(url);
    return { action: "deny" };
  });
  // The window never navigates away from the app's own pages; a followed web link opens in the OS browser.
  window.webContents.on("will-navigate", (event, url) => {
    if (isAppUrl(url, devServerUrl)) return;
    event.preventDefault();
    if (isWebUrl(url)) void shell.openExternal(url);
  });

  void window.loadURL(entryUrl);
  return window;
}
