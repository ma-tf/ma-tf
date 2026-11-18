import type { FragmentBox } from "@lib/fragment-placement";

// @vitest-environment happy-dom
import {
  createFragmentsRuntime,
  DEFAULT_RUNTIME,
  initialFragmentsState,
  reduceFragments,
  startHomeFragments,
} from "@lib/home-fragments";
import { afterEach, beforeEach, describe, expect, it, vi } from "vite-plus/test";

const SIZE = { width: 1440, height: 900 };

function started(seed = 42, reserved: FragmentBox[] = []) {
  const state = initialFragmentsState(seed, 6);
  return reduceFragments(state, { type: "start", size: SIZE, reserved });
}

function grown(seed = 42) {
  let state = started(seed).state;
  state = reduceFragments(state, { type: "tick" }).state;
  state = reduceFragments(state, { type: "tick" }).state;
  return state;
}

function rect(x: number, y: number, width: number, height: number) {
  return {
    x,
    y,
    left: x,
    top: y,
    width,
    height,
    right: x + width,
    bottom: y + height,
    toJSON: () => ({}),
  } as DOMRect;
}

function mockReduced(matches = false) {
  vi.spyOn(window, "matchMedia").mockImplementation(
    (query) =>
      ({
        matches: query === "(prefers-reduced-motion: reduce)" ? matches : false,
        media: query,
        addEventListener: () => {},
        removeEventListener: () => {},
      }) as unknown as MediaQueryList,
  );
}

function mockFrames() {
  vi.spyOn(window, "requestAnimationFrame").mockImplementation((callback) => {
    callback(0);
    return 1;
  });
}

function mockObserver() {
  vi.stubGlobal(
    "ResizeObserver",
    class {
      observe() {}
      unobserve() {}
      disconnect() {}
    },
  );
}

beforeEach(() => {
  document.body.innerHTML = "";
});

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
  vi.useRealTimers();
});

describe("fragment runtime", () => {
  it("exposes the reducer through a runtime handle", () => {
    const runtime = createFragmentsRuntime(42);
    const effects = runtime.dispatch({ type: "start", size: SIZE, reserved: [] });

    expect(runtime.state().visible).toHaveLength(1);
    expect(effects.some((effect) => effect.type === "schedule")).toBe(true);
  });

  it("starts with one visible fragment, two pending and a hold", () => {
    const transition = started();

    expect(transition.state.visible).toHaveLength(1);
    expect(transition.state.pending).toHaveLength(2);
    expect(transition.effects.filter((effect) => effect.type === "place")).toHaveLength(1);
    expect(transition.effects.filter((effect) => effect.type === "reveal")).toHaveLength(1);
    expect(transition.effects.filter((effect) => effect.type === "schedule")).toHaveLength(1);
  });

  it("grows to three over two ticks", () => {
    let state = started().state;

    state = reduceFragments(state, { type: "tick" }).state;
    expect(state.visible).toHaveLength(2);

    state = reduceFragments(state, { type: "tick" }).state;
    expect(state.visible).toHaveLength(3);
    expect(state.pending).toHaveLength(0);
  });

  it("retires the oldest as a replacement arrives", () => {
    const state = grown();
    const before = state.visible.map((fragment) => fragment.slot);
    const transition = reduceFragments(state, { type: "tick" });

    expect(transition.state.visible).toHaveLength(3);
    expect(transition.state.retiring).toHaveLength(1);
    expect(transition.effects.some((effect) => effect.type === "retire")).toBe(true);
    expect(transition.effects.filter((effect) => effect.type === "place")).toHaveLength(1);
    expect(transition.state.visible.some((fragment) => before.includes(fragment.slot))).toBe(true);

    const retired = reduceFragments(transition.state, {
      type: "retired",
      slot: transition.state.retiring[0]!,
    });
    expect(retired.state.retiring).toHaveLength(0);
  });

  it("preserves the visible count across a resize", () => {
    const transition = reduceFragments(grown(), {
      type: "resize",
      size: { width: 1200, height: 800 },
      reserved: [],
    });

    expect(transition.state.visible).toHaveLength(3);
    expect(transition.state.size).toEqual({ width: 1200, height: 800 });
    expect(transition.effects.filter((effect) => effect.type === "hide")).toHaveLength(6);
  });

  it("shows every placed fragment without scheduling under reduced motion", () => {
    const transition = reduceFragments(grown(), { type: "reduced", value: true });

    expect(transition.state.visible).toHaveLength(3);
    expect(transition.effects.some((effect) => effect.type === "schedule")).toBe(false);

    const resumed = reduceFragments(transition.state, { type: "reduced", value: false });
    expect(resumed.effects.some((effect) => effect.type === "schedule")).toBe(true);
  });

  it("pauses the hold while the document is hidden", () => {
    const hidden = reduceFragments(started().state, { type: "visibility", value: "hidden" });
    expect(hidden.state.paused).toBe(true);
    expect(hidden.effects).toContainEqual({ type: "stop" });

    const visible = reduceFragments(hidden.state, { type: "visibility", value: "visible" });
    expect(visible.state.paused).toBe(false);
    expect(visible.effects.some((effect) => effect.type === "schedule")).toBe(true);
  });

  it("refreshes reserves without moving anything", () => {
    const reserved = [{ x: 0, y: 0, width: 100, height: 100 }];
    const transition = reduceFragments(started().state, { type: "obstacles", reserved });

    expect(transition.state.reserved).toEqual(reserved);
    expect(transition.effects).toEqual([]);
  });

  it("cycles a single fragment when only one box fits", () => {
    const reserved = [
      { x: 0, y: 0, width: 1440, height: 32 },
      { x: 0, y: 200, width: 1440, height: 700 },
      { x: 0, y: 0, width: 32, height: 900 },
      { x: 304, y: 0, width: 1136, height: 900 },
    ];
    const state = started(42, reserved).state;
    expect(state.visible).toHaveLength(1);

    const transition = reduceFragments(state, { type: "tick" });
    expect(transition.state.visible).toHaveLength(1);
    expect(transition.effects.some((effect) => effect.type === "retire")).toBe(true);
  });
});

describe("startHomeFragments", () => {
  function renderPage() {
    document.body.innerHTML = [
      "<div data-home-fragments>",
      ...Array.from(
        { length: 6 },
        (_, index) => `<p data-home-fragment hidden class="invisible opacity-0">${index}</p>`,
      ),
      "</div>",
      '<span data-fragments-avoid data-kind="title"></span>',
      '<div data-fragments-avoid data-kind="prev"></div>',
      "<footer data-fragments-avoid></footer>",
    ].join("");

    const root = document.querySelector<HTMLElement>("[data-home-fragments]");
    if (!root) throw new Error("missing root");
    vi.spyOn(root, "getBoundingClientRect").mockReturnValue(rect(0, 0, 1440, 900));
    vi.spyOn(
      document.querySelector<HTMLElement>('[data-kind="title"]')!,
      "getBoundingClientRect",
    ).mockReturnValue(rect(0, 250, 720, 400));
    vi.spyOn(
      document.querySelector<HTMLElement>('[data-kind="prev"]')!,
      "getBoundingClientRect",
    ).mockReturnValue(rect(900, 100, 476, 700));
    vi.spyOn(
      document.querySelector<HTMLElement>("footer")!,
      "getBoundingClientRect",
    ).mockReturnValue(rect(0, 884, 1440, 16));
    return root;
  }

  it("places the first fragment and grows to three", () => {
    vi.useFakeTimers();
    const root = renderPage();
    mockReduced();
    mockFrames();
    mockObserver();

    startHomeFragments();

    const fragments = Array.from(root.querySelectorAll<HTMLElement>("[data-home-fragment]"));
    const shown = () => fragments.filter((fragment) => !fragment.hidden);
    expect(root.dataset.seed).toMatch(/^\d+$/);
    expect(shown()).toHaveLength(1);
    expect(shown()[0]?.style.left).toMatch(/px$/);
    expect(shown()[0]?.style.top).toMatch(/px$/);
    expect(shown()[0]?.style.transitionDuration).toBe(`${DEFAULT_RUNTIME.fade}ms`);
    expect(shown()[0]?.classList.contains("invisible")).toBe(false);

    vi.advanceTimersByTime(12000);
    expect(shown()).toHaveLength(3);

    vi.advanceTimersByTime(6000);
    expect(shown()).toHaveLength(4);

    vi.advanceTimersByTime(DEFAULT_RUNTIME.fade);
    expect(shown()).toHaveLength(3);
  });

  it("shows every placed fragment under reduced motion", () => {
    const root = renderPage();
    mockReduced(true);
    mockFrames();
    mockObserver();

    startHomeFragments();

    const visible = Array.from(root.querySelectorAll<HTMLElement>("[data-home-fragment]")).filter(
      (fragment) => !fragment.hidden,
    );
    expect(visible).toHaveLength(3);
    for (const fragment of visible) {
      expect(fragment.style.opacity).toBe("1");
    }
  });

  it("shows nothing when the layer has no size", () => {
    const root = renderPage();
    vi.spyOn(root, "getBoundingClientRect").mockReturnValue(rect(0, 0, 0, 0));
    mockReduced();
    mockFrames();
    mockObserver();

    startHomeFragments();

    for (const fragment of root.querySelectorAll<HTMLElement>("[data-home-fragment]")) {
      expect(fragment.hidden).toBe(true);
    }
  });

  it("does nothing without the layer", () => {
    mockReduced();
    mockFrames();
    mockObserver();

    expect(() => startHomeFragments()).not.toThrow();
  });
});
