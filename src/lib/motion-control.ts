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

let activeControl: HTMLElement | null = null;
let teardown: (() => void) | null = null;

const initialMode = (): MotionMode | null => {
  const reduced = window.matchMedia(REDUCED_MOTION_QUERY).matches;
  const hasEntrance = document.querySelector(ENTRANCE_OR_TYPEWRITER) !== null;

  if (reduced || !hasEntrance) return "hidden";
  if (document.documentElement.dataset.motion) return "reset";
  return null;
};

export function startMotionControl() {
  const control = document.querySelector<HTMLElement>(CONTROL_SELECTOR);
  if (!control) return;
  if (control === activeControl) return;

  teardown?.();

  activeControl = control;

  const running = new Set<Animation>();
  let fallback = 0;

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

  const onClick = () => {
    if (control.dataset.mode === "reset") reset();
    else skip();
  };

  const onTypewriterStart = () => setMode("skip");
  const onTypewriterEnd = () => settleIfIdle();

  control.addEventListener("click", onClick);
  window.addEventListener(TYPEWRITER_START_EVENT, onTypewriterStart);
  window.addEventListener(TYPEWRITER_END_EVENT, onTypewriterEnd);

  teardown = () => {
    window.clearTimeout(fallback);
    control.removeEventListener("click", onClick);
    window.removeEventListener(TYPEWRITER_START_EVENT, onTypewriterStart);
    window.removeEventListener(TYPEWRITER_END_EVENT, onTypewriterEnd);
    running.clear();
    if (activeControl === control) activeControl = null;
    teardown = null;
  };

  const mode = initialMode();
  if (mode) {
    setMode(mode);
    return;
  }

  setMode("skip");

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

  fallback = window.setTimeout(() => {
    if (running.size === 0 && !isTypewriterRunning()) setMode("reset");
  }, FALLBACK_TIMEOUT);
}
