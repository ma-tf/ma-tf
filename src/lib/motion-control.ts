import {
  TYPEWRITER_END_EVENT,
  TYPEWRITER_START_EVENT,
  finishTypewriter,
  isTypewriterRunning,
} from "@lib/typewriter";

const CONTROL_SELECTOR = "[data-motion-control]";
const ENTRANCE_SELECTOR = '[class*="animate-fade-up"], .animate-fade-in';
const TYPEWRITER_SELECTOR = "[data-typewriter]";
const ENTRANCE_OR_TYPEWRITER = `${ENTRANCE_SELECTOR}, ${TYPEWRITER_SELECTOR}`;
const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";
const FALLBACK_TIMEOUT = 5000;
const VISITED_KEY = "visited-pages";

type MotionMode = "skip" | "reset" | "hidden";

const LABELS: Record<Exclude<MotionMode, "hidden">, string> = {
  skip: "Skip animations",
  reset: "Reset animations",
};

let started = false;

export function startMotionControl() {
  if (started) return;

  const control = document.querySelector<HTMLElement>(CONTROL_SELECTOR);
  if (!control) return;

  started = true;

  const running = new Set<Animation>();

  const setMode = (mode: MotionMode) => {
    control.dataset.mode = mode;
    if (mode === "hidden") return;
    control.setAttribute("aria-label", LABELS[mode]);
    control.setAttribute("title", LABELS[mode]);
  };

  const settleIfIdle = () => {
    if (running.size === 0 && !isTypewriterRunning()) setMode("reset");
  };

  const settle = (animation: Animation) => {
    running.delete(animation);
    settleIfIdle();
  };

  const skip = () => {
    document.documentElement.dataset.motion = "skipped";
    finishTypewriter();
    setMode("reset");
  };

  const reset = () => {
    try {
      const stored = JSON.parse(sessionStorage.getItem(VISITED_KEY) || "[]") as string[];
      const path = location.pathname.replace(/\/+$/, "") || "/";
      sessionStorage.setItem(VISITED_KEY, JSON.stringify(stored.filter((entry) => entry !== path)));
    } catch {
      void 0;
    }
    location.reload();
  };

  control.addEventListener("click", () => {
    if (control.dataset.mode === "reset") reset();
    else skip();
  });

  const reduced = window.matchMedia(REDUCED_MOTION_QUERY).matches;
  const hasEntrance = document.querySelector(ENTRANCE_OR_TYPEWRITER) !== null;

  if (reduced || !hasEntrance) {
    setMode("hidden");
    return;
  }

  if (document.documentElement.dataset.motion) {
    setMode("reset");
    return;
  }

  const watch = (animation: Animation) => {
    if (animation.playState === "finished") return;
    running.add(animation);
    void animation.finished.then(
      () => settle(animation),
      () => settle(animation),
    );
  };

  document
    .querySelectorAll<HTMLElement>(ENTRANCE_SELECTOR)
    .forEach((element) => element.getAnimations().forEach(watch));

  settleIfIdle();

  window.setTimeout(() => {
    if (!isTypewriterRunning()) setMode("reset");
  }, FALLBACK_TIMEOUT);

  window.addEventListener(TYPEWRITER_START_EVENT, () => setMode("skip"));
  window.addEventListener(TYPEWRITER_END_EVENT, settleIfIdle);
}
