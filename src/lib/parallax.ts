const INTENSITY = 40;
const EASING = 0.05;
const DEFAULT_FACTOR = 100;
const HINT = "transform";
const MOBILE_QUERY = "(max-width: 767px)";
const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";
const SELECTOR = "[data-parallax], [data-parallax-x], [data-parallax-y]";

type Layer = {
  element: HTMLElement;
  xFactor: number;
  yFactor: number;
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

  // Islands own these elements, and writing to one before React has hydrated it
  // makes hydration report an unexpected `style` attribute. `load` fires after
  // the eager islands have attached.
  if (document.readyState === "complete") {
    init();
  } else {
    window.addEventListener("load", init, { once: true });
  }
}

function init() {
  const targets: Layer[] = Array.from(document.querySelectorAll<HTMLElement>(SELECTOR)).map(
    (element) => ({ element, xFactor: factor(element, "x"), yFactor: factor(element, "y") }),
  );
  if (targets.length === 0) return;

  const mobile = window.matchMedia(MOBILE_QUERY);
  const reducedMotion = window.matchMedia(REDUCED_MOTION_QUERY);
  const target = { x: 0, y: 0 };
  const current = { x: 0, y: 0 };
  let raf = 0;

  const hint = (value: string) => {
    for (const { element } of targets) element.style.willChange = value;
  };

  const clear = () => {
    for (const { element } of targets) {
      element.style.transform = "";
      element.style.willChange = "";
    }
  };

  const tick = () => {
    const dx = target.x - current.x;
    const dy = target.y - current.y;
    if (Math.abs(dx) < 0.01 && Math.abs(dy) < 0.01) {
      raf = 0;
      hint("");
      return;
    }
    current.x += dx * EASING;
    current.y += dy * EASING;
    for (const { element, xFactor, yFactor } of targets) {
      element.style.transform = `translate(${current.x * xFactor}px, ${current.y * yFactor}px)`;
    }
    raf = requestAnimationFrame(tick);
  };

  const onMouseMove = (event: MouseEvent) => {
    target.x = -(event.clientX / window.innerWidth - 0.5) * 2 * INTENSITY;
    target.y = -(event.clientY / window.innerHeight - 0.5) * 2 * INTENSITY;
    if (!raf) {
      hint(HINT);
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
