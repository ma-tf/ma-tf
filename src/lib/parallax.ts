const INTENSITY = 40;
const EASING = 0.05;
const DEFAULT_FACTOR = 100;
const MOBILE_QUERY = "(max-width: 767px)";
const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";
const SELECTOR = "[data-parallax], [data-parallax-x], [data-parallax-y]";
const ACTIVE_CLASS = "parallax-active";

type Layer = {
  element: HTMLElement;
  xFactor: number;
  yFactor: number;
  effect: KeyframeEffect | null;
};

const factor = (element: HTMLElement, axis: "x" | "y") => {
  const { parallax, parallaxX, parallaxY } = element.dataset;
  const raw = (axis === "x" ? parallaxX : parallaxY) ?? parallax;
  return raw ? Number(raw) / DEFAULT_FACTOR : 0;
};

let started = false;

/**
 * Pointer-driven parallax for every `[data-parallax]` layer on the page.
 * Factors are percentages (default 100), so `data-parallax={30}` moves at 30%;
 * `data-parallax-x` and `data-parallax-y` override a single axis, and an axis
 * with no value stays still. Disabled on touch layouts and under
 * `prefers-reduced-motion`.
 */
export function startParallax() {
  if (started) return;
  started = true;
  init();
}

function init() {
  const targets: Layer[] = Array.from(document.querySelectorAll<HTMLElement>(SELECTOR)).map(
    (element) => ({
      element,
      xFactor: factor(element, "x"),
      yFactor: factor(element, "y"),
      effect: null,
    }),
  );
  if (targets.length === 0) return;

  const mobile = window.matchMedia(MOBILE_QUERY);
  const reducedMotion = window.matchMedia(REDUCED_MOTION_QUERY);
  const target = { x: 0, y: 0 };
  const current = { x: 0, y: 0 };
  let raf = 0;

  const write = (layer: Layer, x: number, y: number) => {
    const transform = `translate(${x}px, ${y}px)`;
    const keyframes = [{ transform }, { transform }];
    if (!layer.effect) {
      layer.effect = layer.element.animate(keyframes, { duration: 1, fill: "both" })
        .effect as KeyframeEffect;
      return;
    }
    layer.effect.setKeyframes(keyframes);
  };

  const clear = () => {
    for (const layer of targets) {
      layer.effect?.setKeyframes([
        { transform: "translate(0px, 0px)" },
        { transform: "translate(0px, 0px)" },
      ]);
    }
    document.documentElement.classList.remove(ACTIVE_CLASS);
  };

  const tick = () => {
    const dx = target.x - current.x;
    const dy = target.y - current.y;
    if (Math.abs(dx) < 0.01 && Math.abs(dy) < 0.01) {
      raf = 0;
      document.documentElement.classList.remove(ACTIVE_CLASS);
      return;
    }
    current.x += dx * EASING;
    current.y += dy * EASING;
    for (const layer of targets) {
      write(layer, current.x * layer.xFactor, current.y * layer.yFactor);
    }
    raf = requestAnimationFrame(tick);
  };

  const onMouseMove = (event: MouseEvent) => {
    target.x = -(event.clientX / window.innerWidth - 0.5) * 2 * INTENSITY;
    target.y = -(event.clientY / window.innerHeight - 0.5) * 2 * INTENSITY;
    if (!raf) {
      document.documentElement.classList.add(ACTIVE_CLASS);
      raf = requestAnimationFrame(tick);
    }
  };

  const sync = () => {
    if (mobile.matches || reducedMotion.matches) {
      window.removeEventListener("mousemove", onMouseMove);
      if (raf) cancelAnimationFrame(raf);
      raf = 0;
      target.x = 0;
      target.y = 0;
      current.x = 0;
      current.y = 0;
      clear();
      return;
    }
    window.addEventListener("mousemove", onMouseMove, { passive: true });
  };

  sync();
  mobile.addEventListener("change", sync);
  reducedMotion.addEventListener("change", sync);
}
