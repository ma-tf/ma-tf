import { MoonIcon, SunIcon } from "@phosphor-icons/react";
import { toggleTheme } from "@stores/theme";
import { cn } from "cn";

export function ModeToggle() {
  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label="Toggle theme"
      title="Toggle theme"
      className={cn("rounded-lg p-2 text-muted-foreground", "hover:text-foreground")}
    >
      <SunIcon size={16} weight="bold" className="block dark:hidden" />
      <MoonIcon size={16} weight="bold" className="hidden dark:block" />
    </button>
  );
}
