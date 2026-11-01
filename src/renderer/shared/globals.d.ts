import type { Api } from "@shared/ipc/contract";
import type { Locale } from "@shared/i18n/locales";
import type en from "../messages/en.json";

declare global {
  interface Window {
    /** Calls to the main process, exposed by the preload; use them only from `ipc-` adapters. */
    readonly api: Api;
  }
}

declare module "use-intl" {
  interface AppConfig {
    Locale: Locale;
    Messages: typeof en;
  }
}

interface ImportMetaEnv {
  readonly VITE_API_URL?: string;
  readonly VITE_ADAPTER?: string;
}
