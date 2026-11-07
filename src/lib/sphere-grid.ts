import { CAM_Y, SPHERE_START_ANGLE, sphereStrokes, swayCamera } from "@lib/sphere-geometry";

const SELECTOR = "svg[data-sphere-grid]";
const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";
const ROTATION_PERIOD_MS = 960_000;
const FRAME_MS = 1000 / 15;
const MAX_DELTA_MS = 250;
const TAU = Math.PI * 2;

export function startSphereGrid() {
  const layers = Array.from(document.querySelectorAll<SVGSVGElement>(SELECTOR)).map((svg) =>
    Array.from(svg.querySelectorAll("path")),
  );
  if (layers.length === 0) return;
  const reducedMotion = window.matchMedia(REDUCED_MOTION_QUERY);

  let raf = 0;
  let elapsed = 0;
  let previous = 0;
  let pending = 0;

  const render = (theta: number, camX: number, camY: number) => {
    const strokes = sphereStrokes(theta, camX, camY);
    for (const paths of layers) {
      const count = Math.min(paths.length, strokes.length);
      for (let i = 0; i < count; i++) {
        const path = paths[i];
        const d = strokes[i];
        if (path && d !== undefined) path.setAttribute("d", d);
      }
    }
  };

  const stop = () => {
    if (raf) cancelAnimationFrame(raf);
    raf = 0;
  };

  const tick = (now: number) => {
    const delta = Math.min(now - previous, MAX_DELTA_MS);
    previous = now;
    elapsed += delta;
    pending += delta;
    if (pending >= FRAME_MS) {
      pending = 0;
      const [camX, camY] = swayCamera(elapsed);
      const theta = (SPHERE_START_ANGLE + (elapsed / ROTATION_PERIOD_MS) * TAU) % TAU;
      render(theta, camX, camY);
    }
    raf = requestAnimationFrame(tick);
  };

  const sync = () => {
    stop();
    if (reducedMotion.matches) {
      elapsed = 0;
      pending = 0;
      render(SPHERE_START_ANGLE, 0, CAM_Y);
      return;
    }
    previous = performance.now();
    pending = FRAME_MS;
    raf = requestAnimationFrame(tick);
  };

  sync();
  reducedMotion.addEventListener("change", sync);
}
