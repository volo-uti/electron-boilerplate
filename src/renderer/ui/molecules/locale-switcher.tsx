import { locales, type Locale } from "@shared/i18n/locales";
import { cn } from "../lib/cn";

type LocaleSwitcherProps = {
  label: string;
  value: Locale;
  onChange: (locale: Locale) => void;
  className?: string;
};

/** Language select listing every supported locale in its own language; takes an accessible `label`. */
export function LocaleSwitcher({ label, value, onChange, className }: LocaleSwitcherProps) {
  return (
    <select
      aria-label={label}
      value={value}
      onChange={(event) => onChange(event.target.value as Locale)}
      className={cn("h-9 rounded-md border bg-background px-2 text-sm", className)}
    >
      {locales.map((locale) => (
        <option key={locale} value={locale}>
          {new Intl.DisplayNames(locale, { type: "language" }).of(locale)}
        </option>
      ))}
    </select>
  );
}
