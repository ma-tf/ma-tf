import {
  DEFAULT_PLACEMENT,
  hashSeed,
  planFragment,
  planFragments,
  seedFromHash,
  slotOrder,
  type FragmentBox,
  type FragmentSize,
  type PlacementOptions,
} from "@lib/fragment-placement";
import { finishTypeText, typeText } from "@lib/typewriter";

export type RuntimeConfig = {
  visible: number;
  hold: number;
  topicHold: number;
  fade: number;
  debounce: number;
};

export const DEFAULT_RUNTIME: RuntimeConfig = {
  visible: 3,
  hold: 6000,
  topicHold: 2000,
  fade: 700,
  debounce: 150,
};

type VisibleFragment = {
  slot: number;
  box: FragmentBox;
};

export type FragmentState = {
  seed: number;
  config: RuntimeConfig;
  placement: PlacementOptions;
  size: FragmentSize | null;
  reserved: FragmentBox[];
  slots: number[];
  visible: VisibleFragment[];
  retiring: number[];
  pending: FragmentBox[];
  topic: string | null;
  topicSlots: number[];
  topicIndex: number;
  tick: number;
  reduced: boolean;
  paused: boolean;
};

export type FragmentEvent =
  | { type: "start"; size: FragmentSize; reserved: FragmentBox[] }
  | { type: "tick" }
  | { type: "resize"; size: FragmentSize; reserved: FragmentBox[] }
  | { type: "obstacles"; reserved: FragmentBox[] }
  | { type: "topic"; topic: string | null; slots: number[] }
  | { type: "reduced"; value: boolean }
  | { type: "visibility"; value: "hidden" | "visible" }
  | { type: "retired"; slot: number };

export type FragmentEffect =
  | { type: "place"; slot: number; box: FragmentBox }
  | { type: "reveal"; slot: number }
  | { type: "retire"; slot: number }
  | { type: "hide"; slot: number }
  | { type: "schedule"; delay: number }
  | { type: "stop" };

export type FragmentTransition = {
  state: FragmentState;
  effects: FragmentEffect[];
};

export function initialFragmentsState(
  seed: number,
  pool: number,
  config: RuntimeConfig = DEFAULT_RUNTIME,
  placement: PlacementOptions = DEFAULT_PLACEMENT,
): FragmentState {
  return {
    seed,
    config,
    placement,
    size: null,
    reserved: [],
    slots: slotOrder(seed, pool),
    visible: [],
    retiring: [],
    pending: [],
    topic: null,
    topicSlots: [],
    topicIndex: 0,
    tick: 0,
    reduced: false,
    paused: false,
  };
}

function slotAvailable(state: FragmentState, slot: number) {
  return (
    !state.visible.some((fragment) => fragment.slot === slot) && !state.retiring.includes(slot)
  );
}

function nextSlot(state: FragmentState) {
  return state.slots.find((slot) => slotAvailable(state, slot));
}

function visibleBoxes(state: FragmentState) {
  return state.visible.map((fragment) => fragment.box);
}

function canRun(state: FragmentState) {
  return state.size !== null && !state.reduced && !state.paused;
}

function placeAll(state: FragmentState, placed: FragmentBox[], effects: FragmentEffect[]) {
  const visible: VisibleFragment[] = [];
  for (const [index, box] of placed.entries()) {
    const slot = state.slots[index];
    if (slot === undefined) break;
    visible.push({ slot, box });
    effects.push({ type: "place", slot, box }, { type: "reveal", slot });
  }
  return visible;
}

function start(
  state: FragmentState,
  event: Extract<FragmentEvent, { type: "start" }>,
): FragmentTransition {
  const base = {
    ...state,
    size: event.size,
    reserved: event.reserved,
    visible: [],
    retiring: [],
    pending: [],
    tick: 0,
  };
  const placed = planFragments(
    state.seed,
    event.size,
    event.reserved,
    state.config.visible,
    state.placement,
  );
  const effects: FragmentEffect[] = [{ type: "stop" }];
  if (placed.length === 0) return { state: base, effects };

  if (state.reduced || state.paused) {
    const visible = placeAll(base, placed, effects);
    return { state: { ...base, visible, pending: [] }, effects };
  }

  const visible = placeAll(base, placed.slice(0, 1), effects);
  const first = visible[0];
  if (!first) return { state: base, effects };

  effects.push({ type: "schedule", delay: state.config.hold });
  return { state: { ...base, visible, pending: placed.slice(1) }, effects };
}

function reset(
  state: FragmentState,
  size: FragmentSize,
  reserved: FragmentBox[],
  showCount: number,
): FragmentTransition {
  const effects: FragmentEffect[] = [{ type: "stop" }];
  for (const slot of state.slots) effects.push({ type: "hide", slot });

  const placed = planFragments(state.seed, size, reserved, Math.max(1, showCount), state.placement);
  const visible = placeAll(state, placed, effects);
  const next = {
    ...state,
    size,
    reserved,
    visible,
    retiring: [],
    pending: [],
    tick: 0,
  };
  if (visible.length > 0 && !state.reduced && !state.paused) {
    effects.push({ type: "schedule", delay: state.config.hold });
  }
  return { state: next, effects };
}

function hideAll(state: FragmentState, effects: FragmentEffect[]) {
  for (const slot of state.slots) effects.push({ type: "hide", slot });
}

function resumeSeeded(state: FragmentState): FragmentTransition {
  if (!state.size) {
    const effects: FragmentEffect[] = [{ type: "stop" }];
    hideAll(state, effects);
    return {
      state: {
        ...state,
        visible: [],
        retiring: [],
        pending: [],
        tick: 0,
        topic: null,
        topicSlots: [],
        topicIndex: 0,
      },
      effects,
    };
  }
  return reset(
    { ...state, topic: null, topicSlots: [], topicIndex: 0 },
    state.size,
    state.reserved,
    1,
  );
}

function placeTopicSlots(
  state: FragmentState,
  size: FragmentSize,
  slots: number[],
  effects: FragmentEffect[],
): VisibleFragment[] {
  const visible: VisibleFragment[] = [];
  for (const [index, slot] of slots.entries()) {
    const box = planFragment(
      hashSeed(`${state.seed}:topic:${state.tick + index}`),
      size,
      state.reserved,
      visible.map((fragment) => fragment.box),
      state.placement,
    );
    if (!box) break;
    visible.push({ slot, box });
    effects.push({ type: "place", slot, box }, { type: "reveal", slot });
  }
  return visible;
}

function showTopic(state: FragmentState): FragmentTransition {
  const effects: FragmentEffect[] = [{ type: "stop" }];
  hideAll(state, effects);

  const base: FragmentState = {
    ...state,
    visible: [],
    retiring: [],
    pending: [],
    tick: 0,
    topicIndex: 0,
  };

  if (!state.size) return { state: base, effects };

  const slots = state.reduced || state.paused ? state.topicSlots : state.topicSlots.slice(0, 1);
  const visible = placeTopicSlots(state, state.size, slots, effects);
  if (visible.length === 0) return { state: base, effects };

  const next = { ...base, visible, topicIndex: visible.length - 1, tick: visible.length };
  if (!state.reduced && !state.paused) {
    effects.push({ type: "schedule", delay: state.config.topicHold });
  }
  return { state: next, effects };
}

function topicTick(state: FragmentState): FragmentTransition {
  if (!canRun(state) || !state.size) return { state, effects: [{ type: "stop" }] };

  const target = Math.min(state.config.visible, state.topicSlots.length);
  const seed = hashSeed(`${state.seed}:topic:${state.tick}`);

  if (state.visible.length < target) {
    const nextIndex = state.topicIndex + 1;
    const slot = state.topicSlots[nextIndex];
    if (slot === undefined) return { state, effects: [{ type: "stop" }] };

    const box = planFragment(
      seed,
      state.size,
      state.reserved,
      visibleBoxes(state),
      state.placement,
    );
    if (!box) return { state, effects: [{ type: "stop" }] };

    return {
      state: {
        ...state,
        tick: state.tick + 1,
        topicIndex: nextIndex,
        visible: [...state.visible, { slot, box }],
      },
      effects: [
        { type: "place", slot, box },
        { type: "reveal", slot },
        { type: "schedule", delay: state.config.topicHold },
      ],
    };
  }

  if (state.topicSlots.length < 2) return { state, effects: [{ type: "stop" }] };

  const outgoing = state.visible[0];
  if (!outgoing) return { state, effects: [{ type: "stop" }] };

  const box = planFragment(
    seed,
    state.size,
    state.reserved,
    state.visible.slice(1).map((fragment) => fragment.box),
    state.placement,
  );
  if (!box) return { state, effects: [{ type: "stop" }] };

  return {
    state: {
      ...state,
      tick: state.tick + 1,
      visible: [...state.visible.slice(1), { slot: outgoing.slot, box }],
    },
    effects: [
      { type: "place", slot: outgoing.slot, box },
      { type: "reveal", slot: outgoing.slot },
      { type: "schedule", delay: state.config.topicHold },
    ],
  };
}

function scheduleHold(state: FragmentState): FragmentTransition {
  return {
    state,
    effects: [{ type: "schedule", delay: state.config.hold }],
  };
}

function grow(state: FragmentState): FragmentTransition | undefined {
  if (!state.size) return undefined;

  const pendingBox = state.pending[0];
  if (pendingBox) {
    const slot = nextSlot(state);
    if (slot === undefined) return undefined;
    return {
      state: {
        ...state,
        pending: state.pending.slice(1),
        visible: [...state.visible, { slot, box: pendingBox }],
      },
      effects: [
        { type: "place", slot, box: pendingBox },
        { type: "reveal", slot },
        { type: "schedule", delay: state.config.hold },
      ],
    };
  }

  const slot = nextSlot(state);
  if (slot === undefined) return undefined;
  const box = planFragment(
    hashSeed(`${state.seed}:${state.tick}`),
    state.size,
    state.reserved,
    visibleBoxes(state),
    state.placement,
  );
  if (!box) return undefined;

  return {
    state: {
      ...state,
      tick: state.tick + 1,
      visible: [...state.visible, { slot, box }],
    },
    effects: [
      { type: "place", slot, box },
      { type: "reveal", slot },
      { type: "schedule", delay: state.config.hold },
    ],
  };
}

function churn(state: FragmentState): FragmentTransition {
  if (!state.size) return scheduleHold(state);

  const outgoing = state.visible[0];
  if (!outgoing) return scheduleHold(state);

  const remaining = state.visible.slice(1);
  const blockers = remaining.map((fragment) => fragment.box);
  const seed = hashSeed(`${state.seed}:${state.tick}`);
  const box =
    planFragment(seed, state.size, state.reserved, [...blockers, outgoing.box], state.placement) ??
    planFragment(seed, state.size, state.reserved, blockers, state.placement);
  if (!box) return scheduleHold(state);

  const occupied = new Set([
    outgoing.slot,
    ...remaining.map((fragment) => fragment.slot),
    ...state.retiring,
  ]);
  const slot = state.slots.find((candidate) => !occupied.has(candidate));
  if (slot === undefined) return scheduleHold(state);

  return {
    state: {
      ...state,
      tick: state.tick + 1,
      visible: [...remaining, { slot, box }],
      retiring: [...state.retiring, outgoing.slot],
    },
    effects: [
      { type: "retire", slot: outgoing.slot },
      { type: "place", slot, box },
      { type: "reveal", slot },
      { type: "schedule", delay: state.config.hold },
    ],
  };
}

function tick(state: FragmentState): FragmentTransition {
  if (state.topic !== null) return topicTick(state);
  if (!canRun(state) || !state.size) return { state, effects: [{ type: "stop" }] };
  if (state.visible.length < state.config.visible) {
    const grown = grow(state);
    if (grown) return grown;
  }
  return churn(state);
}

function reduced(state: FragmentState, value: boolean): FragmentTransition {
  if (value === state.reduced) return { state, effects: [] };
  const next = { ...state, reduced: value };
  if (state.topic !== null) return showTopic(next);
  if (!state.size) return { state: next, effects: [] };
  return reset(
    next,
    state.size,
    state.reserved,
    value ? state.config.visible : Math.max(1, state.visible.length),
  );
}

function visibility(state: FragmentState, value: "hidden" | "visible"): FragmentTransition {
  const paused = value === "hidden";
  if (paused === state.paused) return { state, effects: [] };
  if (paused) return { state: { ...state, paused }, effects: [{ type: "stop" }] };
  if (state.reduced || state.visible.length === 0)
    return { state: { ...state, paused }, effects: [] };
  return {
    state: { ...state, paused },
    effects: [
      {
        type: "schedule",
        delay: state.topic !== null ? state.config.topicHold : state.config.hold,
      },
    ],
  };
}

export function reduceFragments(state: FragmentState, event: FragmentEvent): FragmentTransition {
  switch (event.type) {
    case "start":
      return start(state, event);
    case "tick":
      return tick(state);
    case "resize": {
      if (state.topic !== null) {
        return showTopic({ ...state, size: event.size, reserved: event.reserved });
      }
      return reset(
        state,
        event.size,
        event.reserved,
        state.reduced ? state.config.visible : Math.max(1, state.visible.length),
      );
    }
    case "obstacles":
      return { state: { ...state, reserved: event.reserved }, effects: [] };
    case "topic": {
      const next = {
        ...state,
        topic: event.topic,
        topicSlots: event.slots,
        topicIndex: 0,
        tick: 0,
      };
      return event.topic === null ? resumeSeeded(next) : showTopic(next);
    }
    case "reduced":
      return reduced(state, event.value);
    case "visibility":
      return visibility(state, event.value);
    case "retired":
      return {
        state: {
          ...state,
          retiring: state.retiring.filter((slot) => slot !== event.slot),
        },
        effects: [],
      };
  }
}

export function createFragmentsRuntime(
  seed: number,
  config: RuntimeConfig = DEFAULT_RUNTIME,
  placement: PlacementOptions = DEFAULT_PLACEMENT,
  pool = 6,
) {
  let state = initialFragmentsState(seed, pool, config, placement);
  return {
    state: () => state,
    dispatch(event: FragmentEvent) {
      const transition = reduceFragments(state, event);
      state = transition.state;
      return transition.effects;
    },
  };
}

const LAYER_SELECTOR = "[data-home-fragments]";
const FRAGMENT_SELECTOR = "[data-home-fragment]";
const OBSTACLE_SELECTOR = "[data-fragments-avoid]";
const TITLE_SELECTOR = "[data-title][data-wash]";
const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";
const startedLayers = new WeakSet<Element>();

type RevealToken = {
  cancelled: boolean;
  cancel: () => void;
};

function rectBox(element: Element, bounds: DOMRect): FragmentBox {
  const rect = element.getBoundingClientRect();
  return {
    x: rect.left - bounds.left,
    y: rect.top - bounds.top,
    width: rect.width,
    height: rect.height,
  };
}

export function startHomeFragments() {
  const root = document.querySelector<HTMLElement>(LAYER_SELECTOR);
  if (!root || startedLayers.has(root)) return;

  const elements = Array.from(root.querySelectorAll<HTMLElement>(FRAGMENT_SELECTOR));
  if (elements.length === 0) return;
  startedLayers.add(root);

  const topicSlots = new Map<string, number[]>();
  elements.forEach((element, index) => {
    const topic = element.dataset.fragmentTopic;
    if (!topic) return;
    const slots = topicSlots.get(topic) ?? [];
    slots.push(index);
    topicSlots.set(topic, slots);
  });

  const obstacles = Array.from(document.querySelectorAll<Element>(OBSTACLE_SELECTOR));
  const reduced = window.matchMedia(REDUCED_MOTION_QUERY);
  const seed = seedFromHash(window.location.hash, Date.now());
  const config = DEFAULT_RUNTIME;
  const runtime = createFragmentsRuntime(seed, config, DEFAULT_PLACEMENT, elements.length);
  const fadeTimers = new Map<number, number>();
  const reveals = new Map<number, { cancel: () => void }>();
  let holdTimer: number | undefined;
  let resizeTimer: number | undefined;

  root.dataset.seed = String(seed);
  for (const element of elements) element.style.transitionDuration = `${config.fade}ms`;

  const measureBounds = () => root.getBoundingClientRect();
  const measureSize = (): FragmentSize => {
    const bounds = measureBounds();
    return { width: bounds.width, height: bounds.height };
  };
  const measureReserved = (): FragmentBox[] => {
    const bounds = measureBounds();
    return obstacles
      .map((element) => rectBox(element, bounds))
      .filter((rect) => rect.width > 0 && rect.height > 0);
  };

  const clearHold = () => {
    if (holdTimer === undefined) return;
    window.clearTimeout(holdTimer);
    holdTimer = undefined;
  };

  const clearFade = (slot: number) => {
    const timer = fadeTimers.get(slot);
    if (timer === undefined) return;
    window.clearTimeout(timer);
    fadeTimers.delete(slot);
  };

  const clearReveal = (slot: number) => {
    const current = reveals.get(slot);
    if (!current) return;
    current.cancel();
    reveals.delete(slot);
  };

  const applySchedule = (delay: number) => {
    clearHold();
    holdTimer = window.setTimeout(() => dispatch({ type: "tick" }), delay);
  };

  const applyHide = (slot: number) => {
    const element = elements[slot];
    if (!element) return;
    clearFade(slot);
    clearReveal(slot);
    element.hidden = true;
    element.style.opacity = "0";
  };

  const applyPlace = (slot: number, box: FragmentBox) => {
    const element = elements[slot];
    if (!element) return;
    clearFade(slot);
    clearReveal(slot);
    element.style.left = `${box.x}px`;
    element.style.top = `${box.y}px`;
    element.hidden = false;
    element.classList.remove("invisible");
    element.style.transitionDuration = "0s";
    element.style.opacity = "1";
  };

  const applyReveal = (slot: number) => {
    const element = elements[slot];
    if (!element) return;
    clearReveal(slot);

    const token: RevealToken = {
      cancelled: false,
      cancel: () => {
        token.cancelled = true;
      },
    };
    reveals.set(slot, token);

    window.requestAnimationFrame(() => {
      if (token.cancelled) return;
      element.style.transitionDuration = `${config.fade}ms`;
      if (runtime.state().reduced) {
        finishTypeText(element);
        return;
      }
      reveals.set(slot, typeText(element, { caret: false }));
    });
  };

  const applyRetire = (slot: number) => {
    const element = elements[slot];
    if (!element) return;
    clearFade(slot);
    clearReveal(slot);
    element.style.transitionDuration = `${config.fade}ms`;
    element.style.opacity = "0";
    const timer = window.setTimeout(() => {
      fadeTimers.delete(slot);
      element.hidden = true;
      dispatch({ type: "retired", slot });
    }, config.fade);
    fadeTimers.set(slot, timer);
  };

  const apply = (effect: FragmentEffect) => {
    switch (effect.type) {
      case "stop":
        clearHold();
        return;
      case "schedule":
        applySchedule(effect.delay);
        return;
      case "hide":
        applyHide(effect.slot);
        return;
      case "place":
        applyPlace(effect.slot, effect.box);
        return;
      case "reveal":
        applyReveal(effect.slot);
        return;
      case "retire":
        applyRetire(effect.slot);
        return;
    }
  };

  const dispatch = (event: FragmentEvent) => {
    for (const effect of runtime.dispatch(event)) apply(effect);
  };

  const scheduleResize = () => {
    if (resizeTimer !== undefined) window.clearTimeout(resizeTimer);
    resizeTimer = window.setTimeout(() => {
      resizeTimer = undefined;
      const size = measureSize();
      const current = runtime.state().size;
      if (current && size.width === current.width && size.height === current.height) return;
      dispatch({ type: "resize", size, reserved: measureReserved() });
    }, config.debounce);
  };

  if (typeof ResizeObserver !== "undefined") {
    const layerObserver = new ResizeObserver(scheduleResize);
    layerObserver.observe(root);
    if (obstacles.length > 0) {
      const obstacleObserver = new ResizeObserver(() => {
        dispatch({ type: "obstacles", reserved: measureReserved() });
      });
      for (const element of obstacles) obstacleObserver.observe(element);
    }
  }

  window.addEventListener("resize", scheduleResize, { passive: true });
  reduced.addEventListener("change", () => {
    dispatch({ type: "reduced", value: reduced.matches });
  });
  document.addEventListener("visibilitychange", () => {
    dispatch({
      type: "visibility",
      value: document.hidden ? "hidden" : "visible",
    });
  });

  const enterTitle = (event: Event) => {
    const title = event.currentTarget as HTMLElement;
    const active = document.activeElement;
    if (
      event.type === "pointerenter" &&
      active instanceof HTMLElement &&
      active.closest(TITLE_SELECTOR) &&
      !title.contains(active)
    ) {
      active.blur();
    }
    const topic = title.dataset.wash;
    if (!topic) return;
    dispatch({ type: "topic", topic, slots: topicSlots.get(topic) ?? [] });
  };

  const leaveTitle = (event: Event) => {
    const title = event.currentTarget as HTMLElement;
    const next =
      event instanceof FocusEvent || event instanceof MouseEvent ? event.relatedTarget : null;
    if (next instanceof Node && title.contains(next)) return;
    dispatch({ type: "topic", topic: null, slots: [] });
  };

  for (const title of document.querySelectorAll<HTMLElement>(TITLE_SELECTOR)) {
    title.addEventListener("pointerenter", enterTitle);
    title.addEventListener("pointerleave", leaveTitle);
    title.addEventListener("focusin", enterTitle);
    title.addEventListener("focusout", leaveTitle);
  }

  if (reduced.matches) dispatch({ type: "reduced", value: true });
  dispatch({
    type: "start",
    size: measureSize(),
    reserved: measureReserved(),
  });
}
