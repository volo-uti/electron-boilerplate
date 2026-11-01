import { spawn } from "node:child_process";
import path from "node:path";

// Installer events the app quits for; `--squirrel-firstrun` is not one of them, the app starts normally.
const shortcutArgs: Record<string, string | null> = {
  "--squirrel-install": "--createShortcut",
  "--squirrel-updated": "--createShortcut",
  "--squirrel-uninstall": "--removeShortcut",
  "--squirrel-obsolete": null,
};

/**
 * Handles a Squirrel.Windows installer event (the installer starts the app with a `--squirrel-*` flag
 * to add or remove shortcuts); returns true when the app was started for one and must quit.
 */
export function handleSquirrelEvent(): boolean {
  const event = process.platform === "win32" ? process.argv[1] : undefined;
  if (event === undefined || !Object.hasOwn(shortcutArgs, event)) return false;
  const action = shortcutArgs[event];
  if (action) {
    const update = path.resolve(path.dirname(process.execPath), "..", "Update.exe");
    spawn(update, [`${action}=${path.basename(process.execPath)}`], { detached: true }).on(
      "error",
      () => {},
    );
  }
  return true;
}
