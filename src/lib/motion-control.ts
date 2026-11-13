import {
  TYPEWRITER_END_EVENT,
  TYPEWRITER_START_EVENT,
  finishTypewriter,
  isTypewriterRunning,
} from "@lib/typewriter";

const CONTROL_SELECTOR = "[data-motion-control]";
const ENTRANCE_SELECTOR =
  '[class*="animate-fade-up"], [class*="animate-fade-in"]:not([class*="animate-fade-in-scroll"])';
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

let activeControls = new Set<HTMLElement>();
let teardown: (() => void) | null = null;

const initialMode = (): MotionMode | null => {
  const reduced = window.matchMedia(REDUCED_MOTION_QUERY).matches;
  const hasEntrance = document.querySelector(ENTRANCE_OR_TYPEWRITER) !== null;

  if (reduced || !hasEntrance) return "hidden";
  if (document.documentElement.dataset.motion) return "reset";
  return null;
};

export function startMotionControl() {
  const controls = Array.from(document.querySelectorAll<HTMLElement>(CONTROL_SELECTOR));
  if (controls.length === 0) return;
  if (controls.every((control) => activeControls.has(control))) return;

  teardown?.();

  activeControls = new Set(controls);

  const running = new Set<Animation>();
  let fallback = 0;

  const setMode = (mode: MotionMode) => {
    for (const control of controls) {
      control.dataset.mode = mode;
      if (mode === "hidden") continue;
      control.setAttribute("aria-label", LABELS[mode]);
      control.setAttribute("title", LABELS[mode]);
    }
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
    if (controls[0]?.dataset.mode === "reset") reset();
    else skip();
  };

  const onTypewriterStart = () => setMode("skip");
  const onTypewriterEnd = () => settleIfIdle();

  for (const control of controls) control.addEventListener("click", onClick);
  window.addEventListener(TYPEWRITER_START_EVENT, onTypewriterStart);
  window.addEventListener(TYPEWRITER_END_EVENT, onTypewriterEnd);

  teardown = () => {
    window.clearTimeout(fallback);
    for (const control of controls) control.removeEventListener("click", onClick);
    window.removeEventListener(TYPEWRITER_START_EVENT, onTypewriterStart);
    window.removeEventListener(TYPEWRITER_END_EVENT, onTypewriterEnd);
    running.clear();
    activeControls = new Set();
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
