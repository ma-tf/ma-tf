// --- physics constants ---

const WHEEL_SENSITIVITY = 0.00003;
const FRICTION = 0.94;
const STOP_THRESHOLD = 0.0005;
const BASE_ANGLE = -Math.PI / 2;
const SNAP_DURATION = 400;

// --- types ---

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

function createInitialState(): OrbitState {
  return { mode: "idle", rotation: 0 };
}

function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}

function coerceZero(velocity: number): number {
  return Math.abs(velocity) < STOP_THRESHOLD ? 0 : velocity;
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

function transitionSnapping(
  state: Extract<OrbitState, { mode: "snapping" }>,
  now: number,
): OrbitState {
  const t = Math.min(1, (now - state.snapStartTime) / SNAP_DURATION);
  const eased = easeOutCubic(t);
  const rotation = state.snapFrom + (state.snapTo - state.snapFrom) * eased;
  if (t >= 1 || Math.abs(rotation - state.snapTo) < 0.001) {
    return { mode: "idle", rotation: state.snapTo };
  }
  return { ...state, rotation };
}

function finalizeCoast(rotation: number, config: OrbitConfig, now: number): OrbitState {
  const target = snapTargetFor(rotation, config.n, config.arcSize, config.startAngle);
  if (target === null || config.reduced) {
    return { mode: "idle", rotation: target ?? rotation };
  }
  return { mode: "snapping", rotation, snapFrom: rotation, snapTo: target, snapStartTime: now };
}

function transitionCoasting(
  state: Extract<OrbitState, { mode: "coasting" }>,
  config: OrbitConfig,
  now: number,
): OrbitState {
  const rotation = state.rotation + state.velocity;
  const velocity = coerceZero(state.velocity * FRICTION);
  if (velocity !== 0) {
    return { mode: "coasting", rotation, velocity };
  }
  return finalizeCoast(rotation, config, now);
}

function transitionIdle(state: Extract<OrbitState, { mode: "idle" }>): OrbitState {
  return state;
}

function stepSimulation(state: OrbitState, config: OrbitConfig, now: number): OrbitState {
  switch (state.mode) {
    case "snapping":
      return transitionSnapping(state, now);
    case "coasting":
      return transitionCoasting(state, config, now);
    case "idle":
      return transitionIdle(state);
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
