import {
  TYPEWRITER_END_EVENT,
  TYPEWRITER_START_EVENT,
  finishTypewriter,
  isTypewriterRunning,
} from "@lib/typewriter";
import { FastForwardIcon } from "@phosphor-icons/react";
import { cn } from "cn";
import { useEffect, useState } from "react";

const ENTRANCE_SELECTOR = '[class*="animate-fade-up"], .animate-fade-in';
const FALLBACK_TIMEOUT = 5000;

type Status = "visible" | "hidden";

export function MotionSkipButton() {
  const [status, setStatus] = useState<Status>("visible");

  useEffect(() => {
    if (document.documentElement.dataset.motion) {
      setStatus("hidden");
      return;
    }

    let cancelled = false;
    const running = new Set<Animation>();

    const hideIfIdle = () => {
      if (!cancelled && running.size === 0 && !isTypewriterRunning()) setStatus("hidden");
    };

    const watch = (animation: Animation) => {
      if (animation.playState === "finished") return;
      running.add(animation);
      const settle = () => {
        running.delete(animation);
        hideIfIdle();
      };
      void animation.finished.then(settle, settle);
    };

    document
      .querySelectorAll<HTMLElement>(ENTRANCE_SELECTOR)
      .forEach((element) => element.getAnimations().forEach(watch));

    if (running.size > 0 || isTypewriterRunning()) setStatus("visible");

    const timeout = window.setTimeout(() => {
      if (!cancelled && !isTypewriterRunning()) setStatus("hidden");
    }, FALLBACK_TIMEOUT);

    const onStart = () => {
      if (!cancelled) setStatus("visible");
    };

    window.addEventListener(TYPEWRITER_START_EVENT, onStart);
    window.addEventListener(TYPEWRITER_END_EVENT, hideIfIdle);

    return () => {
      cancelled = true;
      window.clearTimeout(timeout);
      window.removeEventListener(TYPEWRITER_START_EVENT, onStart);
      window.removeEventListener(TYPEWRITER_END_EVENT, hideIfIdle);
    };
  }, []);

  if (status !== "visible") return null;

  return (
    <button
      type="button"
      onClick={() => {
        document.documentElement.dataset.motion = "skipped";
        finishTypewriter();
        setStatus("hidden");
      }}
      aria-label="Skip animations"
      title="Skip animations"
      className={cn("rounded-lg p-2 text-muted-foreground", "hover:text-foreground")}
    >
      <FastForwardIcon size={16} weight="bold" />
    </button>
  );
}
