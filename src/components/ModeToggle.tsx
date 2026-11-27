import type { AnimatedIconHandle } from "@components/icons/animated-icon";

import { Moon as MoonAnimated } from "@components/icons/moon";
import { Sun as SunAnimated } from "@components/icons/sun";
import { toggleTheme } from "@stores/theme";
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
      data-sfx="hover click"
      aria-label="Toggle theme"
      title="Toggle theme"
      className="grid h-full cursor-pointer place-items-center px-1.5 text-muted-foreground transition-colors duration-150 hover:text-foreground dark:text-background/80 dark:hover:text-background"
    >
      <SunAnimated ref={sun} trigger="none" size={12} weight="bold" className="block dark:hidden" />
      <MoonAnimated
        ref={moon}
        trigger="none"
        size={12}
        weight="bold"
        className="hidden dark:block"
      />
    </button>
  );
}
