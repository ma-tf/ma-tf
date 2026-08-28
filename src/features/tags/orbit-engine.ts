// --- physics constants ---

export const WHEEL_SENSITIVITY = 0.00003;
export const FRICTION = 0.94;
export const STOP_THRESHOLD = 0.0005;
export const BASE_ANGLE = -Math.PI / 2;
export const SNAP_DURATION = 400;

// --- types ---

export type OrbitState = {
  rotation: number;
  velocity: number;
  snapTarget: number | null;
  snapFrom: number;
  snapStartTime: number;
};

export type OrbitEngineConfig = {
  n: number;
  arcSize: number;
  startAngle: number;
  reduced: boolean;
  render: (angle: number) => void;
  now?: () => number;
};

export type OrbitEngine = {
  nudge(delta: number): void;
  applyWheel(deltaY: number): void;
  get rotation(): number;
  destroy(): void;
};

// --- pure helpers ---

export function snapTargetFor(
  rotation: number,
  n: number,
  arcSize: number,
  startAngle: number,
): number | null {
  const step = arcSize / n;
  const nearest =
    Math.round((rotation + BASE_ANGLE - startAngle) / step) * step - BASE_ANGLE + startAngle;
  return Math.abs(nearest - rotation) >= 0.001 ? nearest : null;
}

export function frontIndexFor(
  rotation: number,
  n: number,
  arcSize: number,
  startAngle: number,
): number {
  return Math.round((Math.PI - startAngle - rotation) / (arcSize / n));
}

// --- engine ---

export function createOrbitEngine(config: OrbitEngineConfig): OrbitEngine {
  const { n, arcSize, startAngle, reduced, render } = config;
  const now = config.now ?? (() => performance.now());

  let disposed = false;
  let raf = 0;

  const state: OrbitState = {
    rotation: 0,
    velocity: 0,
    snapTarget: null,
    snapFrom: 0,
    snapStartTime: 0,
  };

  function place() {
    render(state.rotation);
  }

  function tick() {
    if (disposed) return;

    if (state.snapTarget !== null) {
      const t = Math.min(1, (now() - state.snapStartTime) / SNAP_DURATION);
      const eased = 1 - Math.pow(1 - t, 3);
      state.rotation = state.snapFrom + (state.snapTarget - state.snapFrom) * eased;
      place();

      if (t >= 1 || Math.abs(state.rotation - state.snapTarget) < 0.001) {
        state.rotation = state.snapTarget;
        state.snapTarget = null;
        place();
        raf = 0;
        return;
      }
      raf = requestAnimationFrame(tick);
      return;
    }

    state.rotation += state.velocity;
    state.velocity *= FRICTION;
    if (Math.abs(state.velocity) < STOP_THRESHOLD) state.velocity = 0;

    place();

    if (state.velocity === 0) {
      const target = snapTargetFor(state.rotation, n, arcSize, startAngle);
      if (target !== null) {
        if (reduced) {
          state.rotation = target;
          place();
        } else {
          state.snapFrom = state.rotation;
          state.snapStartTime = now();
          state.snapTarget = target;
          raf = requestAnimationFrame(tick);
          return;
        }
      }
      raf = 0;
      return;
    }

    raf = requestAnimationFrame(tick);
  }

  function ensureLoop() {
    if (!raf) raf = requestAnimationFrame(tick);
  }

  return {
    nudge(delta: number) {
      state.snapTarget = null;
      state.rotation += delta;
      place();
    },

    applyWheel(deltaY: number) {
      if (reduced) return;
      state.velocity += deltaY * WHEEL_SENSITIVITY;
      state.snapTarget = null;
      ensureLoop();
    },

    get rotation() {
      return state.rotation;
    },

    destroy() {
      disposed = true;
      if (raf) cancelAnimationFrame(raf);
      raf = 0;
    },
  };
}
