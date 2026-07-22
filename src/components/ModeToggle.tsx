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
      <div className="bg-muted flex gap-1 rounded-lg p-1">
        {(["light", "dark", "system"] as const).map((option) => (
          <button
            key={option}
            onClick={() => setTheme(option)}
            className={
              theme === option
                ? "bg-background text-foreground rounded-md px-3 py-1 text-sm font-medium"
                : "text-muted-foreground hover:text-foreground rounded-md px-3 py-1 text-sm"
            }
          >
            {option.charAt(0).toUpperCase() + option.slice(1)}
          </button>
        ))}
      </div>
    </div>
  );
}
