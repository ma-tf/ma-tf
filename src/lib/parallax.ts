const INTENSITY = 40;
const EASING = 0.05;
const DEFAULT_FACTOR = 100;
const SCROLL_COUPLING = 0.3;
const MOBILE_QUERY = "(max-width: 767px)";
const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";
const POINTER_SELECTOR = "[data-parallax], [data-parallax-x], [data-parallax-y]";
const SCROLL_SELECTOR =
  "[data-parallax-scroll] :is([data-parallax], [data-parallax-x], [data-parallax-y])";
const ACTIVE_CLASS = "parallax-active";
const PUSH_SELECTOR = "[data-parallax-push]";
const PUSH_BOTTOM_PAD = 8;

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

const collect = (selector: string): Layer[] =>
  Array.from(document.querySelectorAll<HTMLElement>(selector)).map((element) => ({
    element,
    xFactor: factor(element, "x"),
    yFactor: factor(element, "y"),
    effect: null,
  }));

const pushOffset = (progress: number, bottom: number) => bottom * progress;

function createAnimator(layers: Layer[], scale = 1, easing = EASING) {
  const target = { x: 0, y: 0 };
  const current = { x: 0, y: 0 };
  const overscan = scale === 1 ? "" : ` scale(${scale})`;
  let raf = 0;
  let dirty = false;

  const write = (layer: Layer, x: number, y: number) => {
    const transform = `translate(${x}px, ${y}px)${overscan}`;
    const keyframes = [{ transform }, { transform }];
    if (!layer.effect) {
      layer.effect = layer.element.animate(keyframes, { duration: 1, fill: "both" })
        .effect as KeyframeEffect;
      return;
    }
    layer.effect.setKeyframes(keyframes);
  };

  const reset = () => {
    if (raf) cancelAnimationFrame(raf);
    raf = 0;
    dirty = false;
    target.x = 0;
    target.y = 0;
    current.x = 0;
    current.y = 0;
    for (const layer of layers) {
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
    if (!dirty && Math.max(Math.abs(dx), Math.abs(dy)) < 0.01) {
      raf = 0;
      document.documentElement.classList.remove(ACTIVE_CLASS);
      return;
    }
    dirty = false;
    current.x += dx * easing;
    current.y += dy * easing;
    for (const layer of layers) {
      write(layer, current.x * layer.xFactor, current.y * layer.yFactor);
    }
    raf = requestAnimationFrame(tick);
  };

  return {
    to: (x: number, y: number) => {
      target.x = x;
      target.y = y;
      dirty = true;
      if (raf) return;
      document.documentElement.classList.add(ACTIVE_CLASS);
      raf = requestAnimationFrame(tick);
    },
    reset,
  };
}

function startPointerParallax() {
  const layers = collect(POINTER_SELECTOR);
  if (layers.length === 0) return;

  const animator = createAnimator(layers);
  const mobile = window.matchMedia(MOBILE_QUERY);
  const reducedMotion = window.matchMedia(REDUCED_MOTION_QUERY);

  const onMouseMove = (event: MouseEvent) => {
    animator.to(
      -(event.clientX / window.innerWidth - 0.5) * 2 * INTENSITY,
      -(event.clientY / window.innerHeight - 0.5) * 2 * INTENSITY,
    );
  };

  const sync = () => {
    if (mobile.matches || reducedMotion.matches) {
      window.removeEventListener("mousemove", onMouseMove);
      animator.reset();
      return;
    }
    window.addEventListener("mousemove", onMouseMove, { passive: true });
  };

  sync();
  mobile.addEventListener("change", sync);
  reducedMotion.addEventListener("change", sync);
}

const readScrollConfig = (frame: HTMLElement | null) => ({
  distance: Number(frame?.dataset.parallaxScrollDistance) || 1,
  drift: Number(frame?.dataset.parallaxScrollDrift) || SCROLL_COUPLING,
  scale: Number(frame?.dataset.parallaxScrollScale) || 1,
});

const pushBottomOffset = (title: HTMLElement | undefined, footer: HTMLElement) =>
  title
    ? Math.max(
        0,
        window.innerHeight -
          title.offsetTop -
          title.offsetHeight -
          footer.offsetHeight -
          PUSH_BOTTOM_PAD,
      )
    : 0;

function startScrollParallax() {
  const layers = collect(SCROLL_SELECTOR);
  const pushLayers: Layer[] = Array.from(document.querySelectorAll<HTMLElement>(PUSH_SELECTOR)).map(
    (element) => ({ element, xFactor: 0, yFactor: 1, effect: null }),
  );
  if (layers.length + pushLayers.length === 0) return;

  const frame = document.querySelector<HTMLElement>("[data-parallax-scroll]");
  const title = pushLayers[0]?.element;
  const shove = document.querySelector<HTMLElement>("[data-parallax-shove]");
  const footer = document.querySelector<HTMLElement>("footer")!;
  const mobile = window.matchMedia(MOBILE_QUERY);
  const reducedMotion = window.matchMedia(REDUCED_MOTION_QUERY);
  const { distance, drift, scale } = readScrollConfig(frame);
  const pushBottom = pushBottomOffset(title, footer);
  const animator = createAnimator(layers, scale, 1);
  const pushAnimator = pushLayers.length > 0 ? createAnimator(pushLayers, 1, 1) : null;

  const onScroll = () => {
    const progress = Math.min(window.scrollY / (distance * window.innerHeight), 1);
    animator.to(0, -progress * drift * window.innerHeight);
    if (pushAnimator && title) {
      const edge = shove ? shove.getBoundingClientRect().top : Infinity;
      const span = title.offsetTop + title.offsetHeight;
      pushAnimator.to(0, Math.min(pushOffset(progress, pushBottom), edge - span));
    }
  };

  const sync = () => {
    if (!mobile.matches || reducedMotion.matches) {
      window.removeEventListener("scroll", onScroll);
      animator.reset();
      pushAnimator?.reset();
      return;
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  };

  sync();
  mobile.addEventListener("change", sync);
  reducedMotion.addEventListener("change", sync);
}

let started = false;

/**
 * Pointer-driven parallax on hover-capable layouts, and scroll-driven parallax
 * for `[data-parallax-scroll]` subtrees on touch layouts. Factors are
 * percentages (default 100), so `data-parallax={30}` moves at 30%;
 * `data-parallax-x` and `data-parallax-y` override a single axis, and an axis
 * with no value stays still. Disabled under `prefers-reduced-motion`.
 */
export function startParallax() {
  if (started) return;
  started = true;
  startPointerParallax();
  startScrollParallax();
}
