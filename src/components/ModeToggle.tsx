import type { AnimatedIconHandle } from "@components/icons/animated-icon";

import { Moon as MoonAnimated } from "@components/icons/moon";
import { Sun as SunAnimated } from "@components/icons/sun";
import { toggleTheme } from "@stores/theme";
import { cn } from "cn";
import { useRef } from "react";

export function ModeToggle() {
  const sun = useRef<AnimatedIconHandle>(null);
  const moon = useRef<AnimatedIconHandle>(null);

  const play = () => {
    sun.current?.play();
    moon.current?.play();
  };

  const stop = () => {
    sun.current?.stop();
    moon.current?.stop();
  };

  return (
    <button
      type="button"
      onClick={toggleTheme}
      onMouseEnter={play}
      onMouseLeave={stop}
      aria-label="Toggle theme"
      title="Toggle theme"
      className={cn("cursor-pointer rounded-lg p-2 text-muted-foreground", "hover:text-foreground")}
    >
      <SunAnimated ref={sun} trigger="none" size={16} weight="bold" className="block dark:hidden" />
      <MoonAnimated
        ref={moon}
        trigger="none"
        size={16}
        weight="bold"
        className="hidden dark:block"
      />
    </button>
  );
}
