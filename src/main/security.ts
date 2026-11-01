import { session } from "electron";
import { contentSecurityPolicy } from "./trust";

/** Denies every permission request (camera, microphone, notifications, ...); a feature that needs one allows it here. */
export function denyPermissions() {
  session.defaultSession.setPermissionRequestHandler((_contents, _permission, callback) =>
    callback(false),
  );
  session.defaultSession.setPermissionCheckHandler(() => false);
}

/** Adds the development Content-Security-Policy to every page the Vite dev server sends. */
export function applyDevContentSecurityPolicy(devServerUrl: string) {
  const { origin } = new URL(devServerUrl);
  session.defaultSession.webRequest.onHeadersReceived(
    { urls: [`${origin}/*`] },
    (details, callback) =>
      callback({
        responseHeaders: {
          ...details.responseHeaders,
          "Content-Security-Policy": [contentSecurityPolicy(true)],
        },
      }),
  );
}
