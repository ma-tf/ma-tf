// @vitest-environment happy-dom
import {
  idleDrive,
  pairStiffness,
  sagTarget,
  startHomeWires,
  stepSag,
  stepSpring,
  trackSpeed,
  wirePaths,
} from "@lib/home-wires";
import { afterEach, beforeEach, describe, expect, it, vi } from "vite-plus/test";

const originalMatchMedia = window.matchMedia.bind(window);
const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

function setReducedMotion(matches: boolean) {
  window.matchMedia = (query: string) =>
    ({ matches: matches && query === REDUCED_MOTION_QUERY, media: query }) as MediaQueryList;
}

let rafQueue: FrameRequestCallback[] = [];
let now = 1000;

function mockRafQueue() {
  rafQueue = [];
  now = 1000;
  vi.spyOn(window, "requestAnimationFrame").mockImplementation((callback) => {
    rafQueue.push(callback);
    return rafQueue.length;
  });
}

function flushFrames(count: number) {
  for (let i = 0; i < count; i++) {
    const callback = rafQueue.shift();
    if (!callback) break;
    now += 16;
    callback(now);
  }
}

function renderWires(targets: number) {
  const markers = Array.from(
    { length: targets },
    () => "<span data-title><span data-wire-landing></span><span data-wire-landing></span></span>",
  ).join("");
  const paths = Array.from(
    { length: targets * 2 },
    (_, index) => `<path data-home-wire="${index}" d="">`,
  ).join("");
  document.body.insertAdjacentHTML("beforeend", `<svg data-home-wires>${paths}</svg>${markers}`);
}

function mockPoints(left: number, top: number) {
  for (const [offset, target] of Array.from(
    document.querySelectorAll("span[data-wire-landing]"),
  ).entries()) {
    const x = left + (offset % 2 === 0 ? 0 : 10);
    vi.spyOn(target, "getBoundingClientRect").mockReturnValue({
      left: x,
      top,
      width: 0,
      height: 0,
      right: x,
      bottom: top,
      x,
      y: top,
      toJSON: () => {},
    });
  }
}

beforeEach(() => {
  document.body.innerHTML = "";
});

afterEach(() => {
  vi.restoreAllMocks();
  window.matchMedia = originalMatchMedia;
});

describe("wirePaths", () => {
  it("starts both wires near the top-left corner", () => {
    const [first, second] = wirePaths(0, { x: 118, y: 418 }, { x: 128, y: 418 });

    expect(first).toMatch(/^M 60,0 C/);
    expect(second).toMatch(/^M 70,0 C/);
  });

  it("fans later pairs out from the corner", () => {
    const [first] = wirePaths(2, { x: 118, y: 418 }, { x: 128, y: 418 });

    expect(first).toMatch(/^M 66,0 C/);
  });

  it("lands both wires on their markers", () => {
    const [first, second] = wirePaths(0, { x: 118, y: 418 }, { x: 128, y: 418 });

    expect(first.endsWith("118,418")).toBe(true);
    expect(second.endsWith("128,418")).toBe(true);
  });

  it("separates the pair along the drop", () => {
    const [first, second] = wirePaths(0, { x: 118, y: 418 }, { x: 128, y: 418 });

    expect(first).not.toBe(second);
  });

  it("bows both wires left of their anchors and landings", () => {
    const pair = wirePaths(0, { x: 118, y: 668 }, { x: 128, y: 668 });

    for (const d of pair) {
      const numbers = d.match(/[\d.]+/g)?.map(Number) ?? [];
      const [anchorX = 0, , c1x = 0, , c2x = 0, , landX = 0] = numbers;
      const leftmost = Math.min(c1x, c2x);
      expect(leftmost).toBeLessThan(Math.min(anchorX, landX));
      expect(leftmost).toBeGreaterThan(40);
    }
  });

  it("starts the pair at a caller-supplied origin", () => {
    const [first, second] = wirePaths(0, { x: 118, y: 418 }, { x: 128, y: 418 }, [0, 0], 0, 0, 20);

    expect(first).toMatch(/^M 20,0 C/);
    expect(second).toMatch(/^M 30,0 C/);
  });

  it("shifts each wire by its own offset", () => {
    const [restA, restB] = wirePaths(0, { x: 118, y: 418 }, { x: 128, y: 418 });
    const [swayedA, swayedB] = wirePaths(0, { x: 118, y: 418 }, { x: 128, y: 418 }, [10, -5]);
    const controls = (d: string) => {
      const numbers = d.match(/[\d.]+/g)?.map(Number) ?? [];
      return [numbers[2] ?? 0, numbers[4] ?? 0];
    };
    const [restA1 = 0, restA2 = 0] = controls(restA);
    const [swayedA1 = 0, swayedA2 = 0] = controls(swayedA);
    const [restB1 = 0, restB2 = 0] = controls(restB);
    const [swayedB1 = 0, swayedB2 = 0] = controls(swayedB);

    expect(swayedA).not.toBe(restA);
    expect(swayedB).not.toBe(restB);
    expect(swayedA1).toBeCloseTo(restA1 + 10, 5);
    expect(swayedA2).toBeCloseTo(restA2 + 10, 5);
    expect(swayedB1).toBeCloseTo(restB1 - 5, 5);
    expect(swayedB2).toBeCloseTo(restB2 - 5, 5);
  });

  it("sags each wire from its own value", () => {
    const [single] = wirePaths(0, { x: 118, y: 418 }, { x: 128, y: 418 }, [0, 0], 20);
    const [splitA, splitB] = wirePaths(0, { x: 118, y: 418 }, { x: 128, y: 418 }, [0, 0], 20, 0);

    expect(single).toBe(splitA);
    expect(splitB).not.toBe(splitA);
  });
});

describe("stepSpring", () => {
  it("decays to rest with no drive", () => {
    const state = { x: 10, v: 0 };

    for (let i = 0; i < 600; i++) stepSpring(state, 1 / 60, 60, 0.3, 0);

    expect(Math.abs(state.x)).toBeLessThan(0.01);
  });

  it("holds a steady offset under constant drive", () => {
    const state = { x: 0, v: 0 };

    for (let i = 0; i < 1200; i++) stepSpring(state, 1 / 60, 60, 0.3, 150);

    expect(state.x).toBeCloseTo(2.5, 1);
  });

  it("overshoots before settling", () => {
    const state = { x: 0, v: 0 };
    let max = 0;

    for (let i = 0; i < 600; i++) {
      stepSpring(state, 1 / 60, 60, 0.3, 150);
      max = Math.max(max, state.x);
    }

    expect(max).toBeGreaterThan(2.6);
    expect(state.x).toBeCloseTo(2.5, 1);
  });
});

describe("idleDrive", () => {
  it("oscillates with the pair phase", () => {
    expect(idleDrive(0, 0, 60)).toBeCloseTo(0, 5);
    expect(idleDrive(0, 1, 60)).not.toBeCloseTo(0, 5);
  });

  it("varies stiffness per pair", () => {
    expect(pairStiffness(0)).toBeCloseTo(30, 5);
    expect(pairStiffness(1)).not.toBeCloseTo(pairStiffness(0), 5);
  });
});

describe("sagTarget", () => {
  it("scales with speed and caps", () => {
    expect(sagTarget(0)).toBe(0);
    expect(sagTarget(500)).toBeCloseTo(30, 5);
    expect(sagTarget(5000)).toBeCloseTo(56, 5);
  });
});

describe("stepSag", () => {
  it("converges to the target without bouncing", () => {
    const state = { x: 0, v: 0 };

    for (let i = 0; i < 600; i++) stepSag(state, 1 / 60, 40);

    expect(state.x).toBeCloseTo(40, 1);
  });

  it("relaxes back to zero", () => {
    const state = { x: 30, v: 0 };

    for (let i = 0; i < 600; i++) stepSag(state, 1 / 60, 0);

    expect(Math.abs(state.x)).toBeLessThan(0.01);
  });
});

describe("trackSpeed", () => {
  it("smooths marker speed into a sag target", () => {
    const tracker = { x: 100, y: 400, speed: 0 };

    expect(trackSpeed(tracker, { x: 180, y: 400 }, 0.016)).toBeGreaterThan(0);
    expect(tracker.x).toBe(180);
  });
});

describe("startHomeWires", () => {
  it("paints statically under reduced motion without animating", () => {
    setReducedMotion(true);
    const raf = vi.spyOn(window, "requestAnimationFrame").mockImplementation(() => 0);
    renderWires(1);
    mockPoints(100, 400);

    startHomeWires();

    expect(document.querySelector("path[data-home-wire]")?.getAttribute("d")).toContain("M ");
    expect(raf).not.toHaveBeenCalled();
  });

  it("redraws on resize under reduced motion", () => {
    setReducedMotion(true);
    renderWires(1);
    mockPoints(100, 400);
    startHomeWires();
    const path = document.querySelector("path[data-home-wire]");
    const before = path?.getAttribute("d");

    mockPoints(140, 500);
    window.dispatchEvent(new Event("resize"));

    expect(path?.getAttribute("d")).not.toBe(before);
  });

  it("repaints crossings under reduced motion", () => {
    setReducedMotion(true);
    renderWires(1);
    mockPoints(100, 400);
    startHomeWires();
    const path = document.querySelector("path[data-home-wire]");

    mockPoints(180, 400);
    document
      .querySelector("span[data-wire-landing]")
      ?.dispatchEvent(new Event("pointerover", { bubbles: true }));

    expect(path?.getAttribute("d")).toContain("180,400");
  });

  it("sways control points over time while pinning endpoints", () => {
    setReducedMotion(false);
    mockRafQueue();
    renderWires(1);
    mockPoints(100, 400);
    startHomeWires();
    flushFrames(5);
    const path = document.querySelector("path[data-home-wire]");
    const before = path?.getAttribute("d");

    flushFrames(60);

    const after = path?.getAttribute("d");
    expect(after).not.toBe(before);
    expect(after?.endsWith("100,400")).toBe(true);
  });

  it("follows sliding markers", () => {
    setReducedMotion(false);
    mockRafQueue();
    renderWires(1);
    mockPoints(100, 400);
    startHomeWires();

    mockPoints(180, 400);
    flushFrames(30);

    expect(document.querySelector("path[data-home-wire]")?.getAttribute("d")).toContain("180,400");
  });

  it("sags while markers move fast and recovers after", () => {
    setReducedMotion(false);
    mockRafQueue();
    renderWires(1);
    mockPoints(100, 400);
    startHomeWires();
    flushFrames(5);
    const controlY = () => {
      const numbers =
        document
          .querySelector("path[data-home-wire]")
          ?.getAttribute("d")
          ?.match(/[\d.]+/g)
          ?.map(Number) ?? [];
      return numbers[5] ?? 0;
    };
    const restY = controlY();

    mockPoints(180, 400);
    flushFrames(12);
    expect(controlY()).toBeGreaterThan(restY + 2);

    flushFrames(300);
    expect(controlY()).toBeCloseTo(restY, 0);
  });
});
