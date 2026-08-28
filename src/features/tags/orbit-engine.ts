// --- physics constants ---

const WHEEL_SENSITIVITY = 0.00003;
const FRICTION = 0.94;
const STOP_THRESHOLD = 0.0005;
export const BASE_ANGLE = -Math.PI / 2;
const SNAP_DURATION = 400;

// --- types ---

type Mode = "idle" | "coasting" | "snapping";

type OrbitState = {
  rotation: number;
  velocity: number;
  mode: Mode;
  snapFrom: number;
  snapTo: number;
  snapStartTime: number;
};

export type OrbitConfig = {
  n: number;
  arcSize: number;
  startAngle: number;
  reduced: boolean;
};

export type OrbitEngineConfig = OrbitConfig & {
  render: (angle: number) => void;
  now?: () => number;
};

export type OrbitEngine = {
  nudge(delta: number): void;
  applyWheel(deltaY: number): void;
  get rotation(): number;
  destroy(): void;
};

// --- pure functions ---

export function createInitialState(): OrbitState {
  return {
    rotation: 0,
    velocity: 0,
    mode: "idle",
    snapFrom: 0,
    snapTo: 0,
    snapStartTime: 0,
  };
}

function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}

function snapTargetFor(
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

function stepSimulation(state: OrbitState, config: OrbitConfig, now: number): OrbitState {
  switch (state.mode) {
    case "snapping": {
      const t = Math.min(1, (now - state.snapStartTime) / SNAP_DURATION);
      const eased = easeOutCubic(t);
      const rotation = state.snapFrom + (state.snapTo - state.snapFrom) * eased;
      if (t >= 1 || Math.abs(rotation - state.snapTo) < 0.001) {
        return { ...state, rotation: state.snapTo, mode: "idle", velocity: 0 };
      }
      return { ...state, rotation };
    }

    case "coasting": {
      const rotation = state.rotation + state.velocity;
      let velocity = state.velocity * FRICTION;
      if (Math.abs(velocity) < STOP_THRESHOLD) velocity = 0;

      if (velocity !== 0) {
        return { ...state, rotation, velocity };
      }

      const target = snapTargetFor(rotation, config.n, config.arcSize, config.startAngle);
      if (target === null) {
        return { ...state, rotation, velocity: 0, mode: "idle" };
      }

      if (config.reduced) {
        return { ...state, rotation: target, velocity: 0, mode: "idle" };
      }

      return {
        ...state,
        mode: "snapping",
        snapFrom: rotation,
        snapTo: target,
        snapStartTime: now,
      };
    }

    case "idle":
      return state;
  }
}

// --- engine (loop driver) ---

export function createOrbitEngine(config: OrbitEngineConfig): OrbitEngine {
  const { render, n, arcSize, startAngle, reduced } = config;
  const getTime = config.now ?? (() => performance.now());

  let state = createInitialState();
  let raf = 0;
  let disposed = false;

  function tick() {
    if (disposed) return;
    state = stepSimulation(state, { n, arcSize, startAngle, reduced }, getTime());
    render(state.rotation);
    if (state.mode !== "idle") {
      raf = requestAnimationFrame(tick);
    } else {
      raf = 0;
    }
  }

  return {
    nudge(delta: number) {
      state = { ...state, rotation: state.rotation + delta, mode: "coasting" };
      render(state.rotation);
    },

    applyWheel(deltaY: number) {
      if (reduced) return;
      state = {
        ...state,
        mode: "coasting",
        velocity: state.velocity + deltaY * WHEEL_SENSITIVITY,
      };
      if (!raf) raf = requestAnimationFrame(tick);
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
