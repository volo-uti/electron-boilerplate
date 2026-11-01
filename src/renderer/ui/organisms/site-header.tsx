import { Link } from "@tanstack/react-router";
import type { Locale } from "@shared/i18n/locales";
import { LocaleSwitcher } from "../molecules/locale-switcher";
import { ThemeToggle } from "../molecules/theme-toggle";

type SiteHeaderProps = {
  title: string;
  themeLabel: string;
  localeLabel: string;
  locale: Locale;
  onLocaleChange: (locale: Locale) => void;
};

/** Window header with the home link, locale switcher and theme toggle; all labels are passed in already translated. */
export function SiteHeader({
  title,
  themeLabel,
  localeLabel,
  locale,
  onLocaleChange,
}: SiteHeaderProps) {
  return (
    <header className="border-b">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
        <Link to="/" className="font-semibold">
          {title}
        </Link>
        <div className="flex items-center gap-2">
          <LocaleSwitcher label={localeLabel} value={locale} onChange={onLocaleChange} />
          <ThemeToggle label={themeLabel} />
        </div>
      </div>
    </header>
  );
}
