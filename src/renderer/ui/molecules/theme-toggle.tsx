import { Moon, Sun } from "lucide-react";
import { Button } from "../atoms/button";
import { useTheme } from "../lib/theme";

/** Icon button that flips between light and dark theme; takes an accessible `label`. */
export function ThemeToggle({ label }: { label: string }) {
  const { setTheme } = useTheme();

  // Decide from the live class so the first click is right even when the theme is "system".
  const toggle = () =>
    setTheme(document.documentElement.classList.contains("dark") ? "light" : "dark");

  return (
    <Button variant="ghost" size="icon" aria-label={label} onClick={toggle}>
      <Sun className="dark:hidden" aria-hidden />
      <Moon className="hidden dark:block" aria-hidden />
    </Button>
  );
}
