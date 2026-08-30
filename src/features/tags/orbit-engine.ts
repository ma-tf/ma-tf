const WHEEL_SENSITIVITY = 0.0001;
const FRICTION = 0.94;
const STOP_THRESHOLD = 0.0005;
const BASE_ANGLE = -Math.PI / 2;
const SNAP_DURATION = 400;

type OrbitState =
  | { mode: "idle"; rotation: number }
  | { mode: "coasting"; rotation: number; velocity: number }
  | {
      mode: "snapping";
      rotation: number;
      snapFrom: number;
      snapTo: number;
      snapStartTime: number;
    };

export type OrbitEngine = {
  nudge(delta: number): void;
  applyWheel(deltaY: number): void;
  getFrontIndex(): number;
  destroy(): void;
};

export function createOrbitEngine(config: {
  n: number;
  arcSize: number;
  startAngle: number;
  step: number;
  reduced: boolean;
  initialRotation?: number;
  render: (angle: number) => void;
  now?: () => number;
}): OrbitEngine {
  const { render, n, step, startAngle, reduced } = config;
  const getTime = config.now ?? (() => performance.now());

  function transitionSnapping(
    state: Extract<OrbitState, { mode: "snapping" }>,
    now: number,
  ): OrbitState {
    const t = Math.min(1, (now - state.snapStartTime) / SNAP_DURATION);
    const eased = 1 - Math.pow(1 - t, 3);
    const rotation = state.snapFrom + (state.snapTo - state.snapFrom) * eased;
    return t >= 1 || Math.abs(rotation - state.snapTo) < 0.001
      ? { mode: "idle", rotation: state.snapTo }
      : { ...state, rotation };
  }

  function transitionCoasting(
    state: Extract<OrbitState, { mode: "coasting" }>,
    now: number,
  ): OrbitState {
    const rotation = state.rotation + state.velocity;
    const velocity = state.velocity * FRICTION;
    if (Math.abs(velocity) >= STOP_THRESHOLD) {
      return { mode: "coasting", rotation, velocity };
    }
    const nearest =
      Math.round((rotation + BASE_ANGLE - startAngle) / step) * step - BASE_ANGLE + startAngle;
    if (reduced) {
      return { mode: "idle", rotation: nearest };
    }
    if (Math.abs(nearest - rotation) < 0.001) {
      return { mode: "idle", rotation };
    }
    return { mode: "snapping", rotation, snapFrom: rotation, snapTo: nearest, snapStartTime: now };
  }

  const transitions = {
    snapping: transitionSnapping,
    coasting: transitionCoasting,
    idle: (s: OrbitState): OrbitState => s,
  } as Record<OrbitState["mode"], (state: OrbitState, now: number) => OrbitState>;

  let state: OrbitState = { mode: "idle", rotation: config.initialRotation ?? 0 };
  config.render(state.rotation);
  let raf = 0;
  let disposed = false;

  function tick() {
    if (disposed) return;
    const now = getTime();
    state = transitions[state.mode](state, now);
    render(state.rotation);
    if (state.mode === "idle") {
      raf = 0;
      return;
    }
    raf = requestAnimationFrame(tick);
  }

  return {
    nudge(delta: number) {
      state = { mode: "coasting", rotation: state.rotation + delta, velocity: 0 };
      render(state.rotation);
    },

    applyWheel(deltaY: number) {
      if (reduced) return;
      const velocity = state.mode === "coasting" ? state.velocity : 0;
      state = {
        mode: "coasting",
        rotation: state.rotation,
        velocity: velocity + deltaY * WHEEL_SENSITIVITY,
      };
      if (!raf) raf = requestAnimationFrame(tick);
    },

    getFrontIndex(): number {
      const idx = Math.round(-state.rotation / step);
      return ((idx % n) + n) % n;
    },

    destroy() {
      disposed = true;
      if (raf) cancelAnimationFrame(raf);
      raf = 0;
    },
  };
}
