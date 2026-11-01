import { createContext, useContext, useEffect, useSyncExternalStore, type ReactNode } from "react";

/** Theme choice: `system` follows the OS preference. */
export type Theme = "light" | "dark" | "system";

const STORAGE_KEY = "theme";
const listeners = new Set<() => void>();

function readTheme(): Theme {
  try {
    const value = localStorage.getItem(STORAGE_KEY);
    return value === "light" || value === "dark" ? value : "system";
  } catch {
    return "system";
  }
}

function applyTheme(theme: Theme) {
  const dark =
    theme === "dark" || (theme === "system" && matchMedia("(prefers-color-scheme: dark)").matches);
  document.documentElement.classList.toggle("dark", dark);
}

/** Sets the `dark` class from the stored choice; call once before the first render so the first paint is right. */
export function applyStoredTheme() {
  applyTheme(readTheme());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  window.addEventListener("storage", listener);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", listener);
  };
}

type ThemeContextValue = { theme: Theme; setTheme: (theme: Theme) => void };

const ThemeContext = createContext<ThemeContextValue | null>(null);

type ThemeProviderProps = {
  children: ReactNode;
  /** Called with the current choice on mount and on every change, for example to make native UI follow it. */
  onThemeChange?: (theme: Theme) => void;
};

/** Provides the theme state and applies the `dark` class to `<html>`; mount once near the root. */
export function ThemeProvider({ children, onThemeChange }: ThemeProviderProps) {
  const theme = useSyncExternalStore(subscribe, readTheme, () => "system" as const);

  useEffect(() => {
    applyTheme(theme);
    onThemeChange?.(theme);
    const query = matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => applyTheme(theme);
    query.addEventListener("change", onChange);
    return () => query.removeEventListener("change", onChange);
  }, [theme, onThemeChange]);

  const setTheme = (next: Theme) => {
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // Storage unavailable: the choice applies until the window reloads.
    }
    applyTheme(next);
    listeners.forEach((listener) => listener());
  };

  return <ThemeContext value={{ theme, setTheme }}>{children}</ThemeContext>;
}

/** Reads the current theme and `setTheme`; must be used inside `ThemeProvider`. */
export function useTheme(): ThemeContextValue {
  const value = useContext(ThemeContext);
  if (!value) throw new Error("useTheme must be used inside <ThemeProvider>");
  return value;
}
