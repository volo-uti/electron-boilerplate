import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { matchLocale, type Locale } from "@shared/i18n/locales";

type LocaleState = { locale: Locale; setLocale: (locale: Locale) => void };

/** The chosen locale, kept across restarts; starts from the OS language order (`navigator.languages`). */
export const useLocaleStore = create<LocaleState>()(
  persist(
    (set) => ({
      locale: matchLocale(navigator.languages),
      setLocale: (locale) => set({ locale }),
    }),
    { name: "locale", storage: createJSONStorage(() => localStorage) },
  ),
);
