import { contextBridge, ipcRenderer } from "electron";
import { err } from "@shared/domain/result";
import { contract } from "@shared/ipc/contract";

// Runs sandboxed before the page loads. It exposes one narrow function per contract channel
// as `window.api` and never `ipcRenderer` itself, so the page can make no other IPC call.
const api = Object.fromEntries(
  Object.entries(contract).map(([area, calls]) => [
    area,
    Object.fromEntries(
      Object.entries(calls).map(([method, { name }]) => [
        method,
        async (input?: unknown) => {
          try {
            return await ipcRenderer.invoke(name, input);
          } catch (cause) {
            return err({
              kind: "ipc",
              message: cause instanceof Error ? cause.message : String(cause),
            });
          }
        },
      ]),
    ),
  ]),
);

contextBridge.exposeInMainWorld("api", api);
