import { net, protocol } from "electron";
import { pathToFileURL } from "node:url";
import { APP_SCHEME, contentSecurityPolicy, resolveAsset } from "./trust";

/** Registers `app://` as a standard, secure scheme; must run before the app is ready. */
export function registerAppScheme() {
  protocol.registerSchemesAsPrivileged([
    { scheme: APP_SCHEME, privileges: { standard: true, secure: true, supportFetchAPI: true } },
  ]);
}

/** Serves the built renderer in `root` on `app://renderer/` with the app's Content-Security-Policy. */
export function serveRenderer(root: string) {
  protocol.handle(APP_SCHEME, async (request) => {
    const file = resolveAsset(root, request.url);
    if (!file) return new Response("Not found", { status: 404 });
    const response = await net.fetch(pathToFileURL(file).toString());
    const headers = new Headers(response.headers);
    headers.set("Content-Security-Policy", contentSecurityPolicy(false));
    return new Response(response.body, { status: response.status, headers });
  });
}
