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
  const listeners: Array<() => void> = [];
  let reduced = matches;
  vi.spyOn(window, "matchMedia").mockImplementation(
    (query) =>
      ({
        get matches() {
          return query === "(prefers-reduced-motion: reduce)" ? reduced : false;
        },
        media: query,
        addEventListener: (_type: string, listener: () => void) => {
          listeners.push(listener);
        },
        removeEventListener: () => {},
      }) as unknown as MediaQueryList,
  );
  return (value: boolean) => {
    reduced = value;
    for (const listener of listeners) listener();
  };
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

  it("clears the layer and shows the first topic fragment on hover", () => {
    const transition = reduceFragments(grown(), {
      type: "topic",
      topic: "ember",
      slots: [2, 3, 4],
    });

    expect(transition.effects.filter((effect) => effect.type === "hide")).toHaveLength(6);
    expect(transition.state.topic).toBe("ember");
    expect(transition.state.visible.map((fragment) => fragment.slot)).toEqual([2]);
    expect(transition.effects.some((effect) => effect.type === "schedule")).toBe(true);
  });

  it("grows a topic to three, then rotates it", () => {
    let state = reduceFragments(grown(), {
      type: "topic",
      topic: "ember",
      slots: [2, 3, 4],
    }).state;
    expect(state.visible.map((fragment) => fragment.slot)).toEqual([2]);

    state = reduceFragments(state, { type: "tick" }).state;
    expect(state.visible.map((fragment) => fragment.slot)).toEqual([2, 3]);

    state = reduceFragments(state, { type: "tick" }).state;
    expect(state.visible.map((fragment) => fragment.slot)).toEqual([2, 3, 4]);

    const rotated = reduceFragments(state, { type: "tick" });
    expect(rotated.state.visible.map((fragment) => fragment.slot)).toEqual([3, 4, 2]);
    expect(rotated.effects.some((effect) => effect.type === "reveal")).toBe(true);
    expect(rotated.effects.some((effect) => effect.type === "schedule")).toBe(true);
  });

  it("holds a single-fragment topic without rotating", () => {
    const state = reduceFragments(grown(), {
      type: "topic",
      topic: "gray",
      slots: [3],
    }).state;
    expect(state.visible.map((fragment) => fragment.slot)).toEqual([3]);

    const held = reduceFragments(state, { type: "tick" });
    expect(held.state.visible.map((fragment) => fragment.slot)).toEqual([3]);
    expect(held.effects.some((effect) => effect.type === "schedule")).toBe(false);
  });

  it("resumes the seeded loop when the pointer leaves", () => {
    const hovered = reduceFragments(grown(), {
      type: "topic",
      topic: "ember",
      slots: [2, 3, 4],
    }).state;

    const resumed = reduceFragments(hovered, { type: "topic", topic: null, slots: [] });

    expect(resumed.state.topic).toBeNull();
    expect(resumed.state.visible).toHaveLength(1);
    expect(resumed.effects.some((effect) => effect.type === "schedule")).toBe(true);
  });

  it("places every topic fragment under reduced motion", () => {
    const reduced = reduceFragments(grown(), { type: "reduced", value: true }).state;
    const transition = reduceFragments(reduced, {
      type: "topic",
      topic: "ember",
      slots: [2, 3, 4],
    });

    expect(transition.state.visible.map((fragment) => fragment.slot)).toEqual([2, 3, 4]);
    expect(transition.effects.some((effect) => effect.type === "schedule")).toBe(false);
  });
});

describe("startHomeFragments", () => {
  function renderPage() {
    document.body.innerHTML = [
      "<div data-home-fragments>",
      ...["ember", "ember", "ember", "gray", "taupe", "taupe"].map(
        (topic, index) =>
          `<p data-home-fragment data-fragment-topic="${topic}" hidden class="invisible opacity-0">fragment ${index}</p>`,
      ),
      "</div>",
      '<span data-title data-wash="ember"><a href="/photography">ember</a></span>',
      '<span data-title data-wash="gray"><a href="/graphics">gray</a></span>',
      '<span data-title data-wash="taupe"><a href="/music">taupe</a></span>',
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

  it("types each fragment in without a caret", () => {
    vi.useFakeTimers();
    const root = renderPage();
    mockReduced();
    mockFrames();
    mockObserver();

    startHomeFragments();

    const first = Array.from(root.querySelectorAll<HTMLElement>("[data-home-fragment]")).find(
      (fragment) => !fragment.hidden,
    );
    if (!first) throw new Error("missing fragment");
    expect(first.classList.contains("typewriter-active")).toBe(true);
    expect(first.querySelector(".typewriter-caret")).toBeNull();

    const chars = first.querySelectorAll(".typewriter-char");
    expect(chars.length).toBeGreaterThan(1);
    expect(first.querySelectorAll(".typewriter-char-typed")).toHaveLength(0);

    vi.advanceTimersByTime(20);
    const typed = first.querySelectorAll(".typewriter-char-typed").length;
    expect(typed).toBeGreaterThan(0);
    expect(typed).toBeLessThan(chars.length);

    vi.advanceTimersByTime(1000);
    expect(first.querySelectorAll(".typewriter-char-typed")).toHaveLength(chars.length);
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
      expect(fragment.classList.contains("typewriter-active")).toBe(false);
    }
    expect(root.querySelector(".typewriter-char")).toBeNull();
  });

  it("completes typing when reduced motion turns on", () => {
    vi.useFakeTimers();
    const root = renderPage();
    const setReduced = mockReduced();
    mockFrames();
    mockObserver();

    startHomeFragments();

    const first = Array.from(root.querySelectorAll<HTMLElement>("[data-home-fragment]")).find(
      (fragment) => !fragment.hidden,
    );
    if (!first) throw new Error("missing fragment");

    vi.advanceTimersByTime(20);
    expect(first.querySelectorAll(".typewriter-char-typed").length).toBeLessThan(
      first.querySelectorAll(".typewriter-char").length,
    );

    setReduced(true);

    expect(first.querySelectorAll(".typewriter-char")).toHaveLength(10);
    expect(first.querySelectorAll(".typewriter-char-typed")).toHaveLength(10);
  });

  it("grows a title's fragments to three, rotates, and resumes on leave", () => {
    vi.useFakeTimers();
    const root = renderPage();
    mockReduced();
    mockFrames();
    mockObserver();

    startHomeFragments();

    const fragments = Array.from(root.querySelectorAll<HTMLElement>("[data-home-fragment]"));
    const shown = () => fragments.filter((fragment) => !fragment.hidden);
    const typed = (fragment: HTMLElement) =>
      fragment.querySelectorAll(".typewriter-char-typed").length;

    vi.advanceTimersByTime(12000);
    expect(shown()).toHaveLength(3);

    const title = document.querySelector<HTMLElement>('[data-title][data-wash="ember"]');
    if (!title) throw new Error("missing title");
    title.dispatchEvent(new Event("pointerenter"));

    expect(shown()).toEqual([fragments[0]]);

    vi.advanceTimersByTime(DEFAULT_RUNTIME.topicHold);
    expect(shown()).toEqual([fragments[0], fragments[1]]);

    vi.advanceTimersByTime(DEFAULT_RUNTIME.topicHold);
    expect(shown()).toEqual([fragments[0], fragments[1], fragments[2]]);
    expect(typed(fragments[1]!)).toBe(10);

    vi.advanceTimersByTime(DEFAULT_RUNTIME.topicHold);
    expect(shown()).toEqual([fragments[0], fragments[1], fragments[2]]);
    expect(typed(fragments[0]!)).toBeLessThan(10);
    expect(typed(fragments[2]!)).toBe(10);

    title.dispatchEvent(new Event("pointerleave"));
    expect(shown()).toHaveLength(1);
  });

  it("places a title's fragments on hover under reduced motion", () => {
    const root = renderPage();
    mockReduced(true);
    mockFrames();
    mockObserver();

    startHomeFragments();

    const title = document.querySelector<HTMLElement>('[data-title][data-wash="ember"]');
    if (!title) throw new Error("missing title");
    title.dispatchEvent(new Event("pointerenter"));

    const fragments = Array.from(root.querySelectorAll<HTMLElement>("[data-home-fragment]"));
    const shown = fragments.filter((fragment) => !fragment.hidden);
    expect(shown).toEqual([fragments[0], fragments[1], fragments[2]]);
    for (const fragment of shown) expect(fragment.style.opacity).toBe("1");
    expect(root.querySelector(".typewriter-char")).toBeNull();
  });

  it("drops a restored title focus when the pointer enters another title", () => {
    renderPage();
    mockReduced();
    mockFrames();
    mockObserver();

    startHomeFragments();

    const ember = document.querySelector<HTMLElement>('[data-title][data-wash="ember"]');
    const gray = document.querySelector<HTMLElement>('[data-title][data-wash="gray"]');
    const focused = ember?.querySelector<HTMLAnchorElement>("a");
    if (!ember || !gray || !focused) throw new Error("missing titles");
    focused.focus();
    expect(document.activeElement).toBe(focused);

    gray.dispatchEvent(new Event("pointerenter"));

    expect(document.activeElement).not.toBe(focused);
  });

  it("keeps a title's focus when the pointer enters that title", () => {
    renderPage();
    mockReduced();
    mockFrames();
    mockObserver();

    startHomeFragments();

    const ember = document.querySelector<HTMLElement>('[data-title][data-wash="ember"]');
    const focused = ember?.querySelector<HTMLAnchorElement>("a");
    if (!ember || !focused) throw new Error("missing title");
    focused.focus();

    ember.dispatchEvent(new Event("pointerenter"));

    expect(document.activeElement).toBe(focused);
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
