import { useEffect, type ReactNode } from "react";
import { IntlProvider } from "use-intl";
import type { Locale } from "@shared/i18n/locales";
import en from "../../messages/en.json";
import ko from "../../messages/ko.json";
import { useLocaleStore } from "./locale-store";

const messages: Record<Locale, typeof en> = { en, ko };

/** Provides use-intl messages for the chosen locale and keeps `<html lang>` in step with it. */
export function I18nProvider({ children }: { children: ReactNode }) {
  const locale = useLocaleStore((state) => state.locale);

  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  return (
    <IntlProvider locale={locale} messages={messages[locale]}>
      {children}
    </IntlProvider>
  );
}
