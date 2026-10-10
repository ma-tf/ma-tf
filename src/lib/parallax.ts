const INTENSITY = 40;
const EASING = 0.05;
const DEFAULT_FACTOR = 100;
const SCROLL_COUPLING = 0.3;
const MOBILE_QUERY = "(max-width: 767px)";
const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";
const POINTER_SELECTOR = "[data-parallax], [data-parallax-x], [data-parallax-y]";
const SCROLL_FRAME_SELECTOR = "[data-parallax-scroll]";
const SCROLL_LAYER_SELECTOR =
  ":is([data-parallax], [data-parallax-x], [data-parallax-y], [data-parallax-mobile], [data-parallax-mobile-x], [data-parallax-mobile-y])";
const ACTIVE_CLASS = "parallax-active";
const PUSH_SELECTOR = "[data-parallax-push]";
const PUSH_COUPLING = 0.3;

type Axis = "x" | "y";
type Factor = (element: HTMLElement, axis: Axis) => number;

type Layer = {
  element: HTMLElement;
  xFactor: number;
  yFactor: number;
  effect: KeyframeEffect | null;
};

const sharedFactor: Factor = (element, axis) => {
  const { parallax, parallaxX, parallaxY } = element.dataset;
  const raw = (axis === "x" ? parallaxX : parallaxY) ?? parallax;
  return raw ? Number(raw) / DEFAULT_FACTOR : 0;
};

const scrollFactor: Factor = (element, axis) => {
  const { parallaxMobile, parallaxMobileX, parallaxMobileY } = element.dataset;
  const raw = (axis === "x" ? parallaxMobileX : parallaxMobileY) ?? parallaxMobile;
  return raw === undefined ? sharedFactor(element, axis) : Number(raw) / DEFAULT_FACTOR;
};

const collect = (elements: Iterable<HTMLElement>, factor: Factor): Layer[] =>
  Array.from(elements).map((element) => ({
    element,
    xFactor: factor(element, "x"),
    yFactor: factor(element, "y"),
    effect: null,
  }));

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
  const layers = collect(document.querySelectorAll<HTMLElement>(POINTER_SELECTOR), sharedFactor);
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

const createRunner = (frame: HTMLElement) => {
  const layers = collect(frame.querySelectorAll<HTMLElement>(SCROLL_LAYER_SELECTOR), scrollFactor);
  const { distance, drift, scale } = readScrollConfig(frame);
  return {
    distance,
    drift,
    animator: layers.length > 0 ? createAnimator(layers, scale, 1) : null,
  };
};

function startScrollParallax() {
  const frames = Array.from(document.querySelectorAll<HTMLElement>(SCROLL_FRAME_SELECTOR));
  const pushLayers: Layer[] = Array.from(document.querySelectorAll<HTMLElement>(PUSH_SELECTOR)).map(
    (element) => ({ element, xFactor: 0, yFactor: 1, effect: null }),
  );
  if (frames.length + pushLayers.length === 0) return;

  const mobile = window.matchMedia(MOBILE_QUERY);
  const reducedMotion = window.matchMedia(REDUCED_MOTION_QUERY);

  const runners = frames.map(createRunner);
  const pushAnimator = pushLayers.length > 0 ? createAnimator(pushLayers, 1, 1) : null;
  const page = readScrollConfig(frames[0] ?? null);

  const onScroll = () => {
    for (const { distance, drift, animator } of runners) {
      if (!animator) continue;
      const progress = Math.min(window.scrollY / (distance * window.innerHeight), 1);
      animator.to(0, -progress * drift * window.innerHeight);
    }
    if (pushAnimator) {
      const progress = Math.min(window.scrollY / (page.distance * window.innerHeight), 1);
      pushAnimator.to(0, progress * PUSH_COUPLING * window.innerHeight);
    }
  };

  const sync = () => {
    if (!mobile.matches || reducedMotion.matches) {
      window.removeEventListener("scroll", onScroll);
      for (const { animator } of runners) animator?.reset();
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
 * for the subtrees of every `[data-parallax-scroll]` frame on touch layouts;
 * each frame reads its own `data-parallax-scroll-*` config. Factors are
 * percentages (default 100), so `data-parallax={30}` moves at 30%;
 * `data-parallax-x` and `data-parallax-y` override a single axis, and an axis
 * with no value stays still. The scroll driver also reads `data-parallax-mobile`
 * (and `-x`/`-y`), which the pointer driver ignores, so a layer can move on
 * touch layouts without drifting on desktop. Disabled under
 * `prefers-reduced-motion`.
 */
export function startParallax() {
  if (started) return;
  started = true;
  startPointerParallax();
  startScrollParallax();
}
