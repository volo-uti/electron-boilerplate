import { ipcMain, type IpcMainInvokeEvent } from "electron";
import type { z } from "zod";
import type { AppError } from "@shared/domain/errors";
import { err, type Result } from "@shared/domain/result";
import type { Channel } from "@shared/ipc/contract";
import { isAppUrl } from "../trust";

/** Handler of one contract channel: gets the validated input and returns a `Result`. */
export type Handler<C extends Channel> = (
  input: z.output<C["input"]>,
  event: IpcMainInvokeEvent,
) => Result<z.output<C["output"]>, AppError> | Promise<Result<z.output<C["output"]>, AppError>>;

/** Registers the handler of a contract channel; calls from frames outside the app and invalid input are refused. */
export function handle<C extends Channel>(channel: C, handler: Handler<C>, devServerUrl?: string) {
  ipcMain.handle(channel.name, (event, raw: unknown) => {
    if (!isAppUrl(event.senderFrame?.url ?? "", devServerUrl)) {
      return err({ kind: "ipc", message: `${channel.name}: refused, the sender is not the app` });
    }
    const input = channel.input.safeParse(raw);
    if (!input.success) {
      return err({ kind: "ipc", message: `${channel.name}: ${input.error.message}` });
    }
    return handler(input.data as z.output<C["input"]>, event);
  });
}
