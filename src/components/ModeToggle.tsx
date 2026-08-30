import { cn } from "@lib/cn";
import { useStore } from "@nanostores/react";
import { SunIcon, MoonIcon } from "@phosphor-icons/react";
import { theme, toggleTheme } from "@stores/theme";

export function ModeToggle() {
  const current = useStore(theme);
  const Icon = current === "dark" ? MoonIcon : SunIcon;

  return (
    <div className="fixed top-0 right-0 z-50">
      <button
        type="button"
        onClick={toggleTheme}
        aria-label={`Theme: ${current}`}
        title={`Theme: ${current}`}
        className={cn("rounded-lg p-2 text-muted-foreground", "hover:text-foreground")}
      >
        <Icon size={16} weight="bold" />
      </button>
    </div>
  );
}
