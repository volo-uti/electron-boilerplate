/** Supported locale codes. */
export const locales = ["en", "ko"] as const;
/** Union of the supported locale codes. */
export type Locale = (typeof locales)[number];
/** Locale used when none of the preferred languages is supported. */
export const defaultLocale: Locale = "en";

/** Type guard that narrows a string to a supported `Locale`. */
export const isLocale = (value: string): value is Locale =>
  (locales as readonly string[]).includes(value);

/** Picks the first supported locale from language tags in order of preference (`navigator.languages`), else the default. */
export function matchLocale(preferred: readonly string[]): Locale {
  for (const tag of preferred) {
    const language = tag.toLowerCase().split("-")[0] ?? "";
    if (isLocale(language)) return language;
  }
  return defaultLocale;
}
