import { SunIcon, MoonIcon, MonitorIcon } from "@phosphor-icons/react";
import { useState, useEffect } from "react";

type Theme = "light" | "dark" | "system";

export function ModeToggle() {
  const [theme, setTheme] = useState<Theme>("system");

  useEffect(() => {
    const stored = localStorage.getItem("theme") as Theme | null;
    if (stored) {
      setTheme(stored);
    }
  }, []);

  useEffect(() => {
    const root = document.documentElement;

    const applyTheme = (t: Theme) => {
      if (t === "system") {
        const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
        root.classList.toggle("dark", prefersDark);
      } else {
        root.classList.toggle("dark", t === "dark");
      }
    };

    applyTheme(theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  return (
    <div className="fixed top-4 right-4 z-50">
      <div className="flex gap-1 rounded-lg bg-muted p-1">
        {(["light", "dark", "system"] as const).map((option) => (
          <button
            type="button"
            key={option}
            onClick={() => setTheme(option)}
            aria-label={option}
            className={
              theme === option
                ? "rounded-md bg-background p-2 text-foreground"
                : "rounded-md p-2 text-muted-foreground hover:text-foreground"
            }
          >
            {option === "light" && <SunIcon size={16} weight="bold" />}
            {option === "dark" && <MoonIcon size={16} weight="bold" />}
            {option === "system" && <MonitorIcon size={16} weight="bold" />}
          </button>
        ))}
      </div>
    </div>
  );
}
