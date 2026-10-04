import {
  TYPEWRITER_END_EVENT,
  TYPEWRITER_START_EVENT,
  finishTypewriter,
  isTypewriterRunning,
} from "@lib/typewriter";
import { useEffect, useEffectEvent, useRef, useState } from "react";

const ENTRANCE_SELECTOR = '[class*="animate-fade-up"], .animate-fade-in';
const TYPEWRITER_SELECTOR = "[data-typewriter]";
const ENTRANCE_OR_TYPEWRITER = `${ENTRANCE_SELECTOR}, ${TYPEWRITER_SELECTOR}`;
const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";
const FALLBACK_TIMEOUT = 5000;
const VISITED_KEY = "visited-pages";

type MotionMode = "skip" | "reset" | "hidden";

function skipMotion(setMode: (mode: MotionMode) => void) {
  document.documentElement.dataset.motion = "skipped";
  finishTypewriter();
  setMode("reset");
}

function reset() {
  try {
    const stored = JSON.parse(sessionStorage.getItem(VISITED_KEY) || "[]") as string[];
    const path = location.pathname.replace(/\/+$/, "") || "/";
    sessionStorage.setItem(VISITED_KEY, JSON.stringify(stored.filter((entry) => entry !== path)));
  } catch {
    void 0;
  }
  location.reload();
}

export function useMotionControl() {
  const [mode, setMode] = useState<MotionMode>("skip");
  const running = useRef(new Set<Animation>());

  const settleIfIdle = useEffectEvent(() => {
    if (running.current.size === 0 && !isTypewriterRunning()) setMode("reset");
  });

  const settle = useEffectEvent((animation: Animation) => {
    running.current.delete(animation);
    settleIfIdle();
  });

  const onTypewriterStart = useEffectEvent(() => setMode("skip"));

  const skip = () => skipMotion(setMode);

  useEffect(() => {
    const reduced = window.matchMedia(REDUCED_MOTION_QUERY).matches;
    const hasEntrance = document.querySelector(ENTRANCE_OR_TYPEWRITER) !== null;

    if (reduced || !hasEntrance) return setMode("hidden");
    if (document.documentElement.dataset.motion) return setMode("reset");

    running.current.clear();

    const watch = (animation: Animation) => {
      if (animation.playState === "finished") return;
      running.current.add(animation);
      void animation.finished.then(
        () => settle(animation),
        () => settle(animation),
      );
    };

    document
      .querySelectorAll<HTMLElement>(ENTRANCE_SELECTOR)
      .forEach((element) => element.getAnimations().forEach(watch));

    settleIfIdle();

    const timeout = window.setTimeout(() => {
      if (!isTypewriterRunning()) setMode("reset");
    }, FALLBACK_TIMEOUT);

    window.addEventListener(TYPEWRITER_START_EVENT, onTypewriterStart);
    window.addEventListener(TYPEWRITER_END_EVENT, settleIfIdle);

    return () => {
      window.clearTimeout(timeout);
      window.removeEventListener(TYPEWRITER_START_EVENT, onTypewriterStart);
      window.removeEventListener(TYPEWRITER_END_EVENT, settleIfIdle);
    };
  }, []);

  return { mode, skip, reset };
}
