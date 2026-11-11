// @vitest-environment happy-dom
import { startHomeWires, wirePaths } from "@lib/home-wires";
import { afterEach, beforeEach, describe, expect, it, vi } from "vite-plus/test";

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
});

describe("startHomeWires", () => {
  it("does nothing when the overlay is absent", () => {
    document.body.insertAdjacentHTML("beforeend", "<span data-wire-landing></span>");

    expect(() => startHomeWires()).not.toThrow();
  });

  it("draws two wires per target", () => {
    renderWires(2);
    mockPoints(100, 400);

    startHomeWires();

    const paths = document.querySelectorAll("path[data-home-wire]");
    expect(paths[0]?.getAttribute("d")).toContain("M ");
    expect(paths[1]?.getAttribute("d")).toContain("M ");
    expect(paths[2]?.getAttribute("d")).toContain("M ");
    expect(paths[3]?.getAttribute("d")).toContain("M ");
  });

  it("redraws when the viewport resizes", () => {
    renderWires(1);
    mockPoints(100, 400);
    startHomeWires();
    const path = document.querySelector("path[data-home-wire]");
    const before = path?.getAttribute("d");

    mockPoints(140, 500);
    window.dispatchEvent(new Event("resize"));

    expect(path?.getAttribute("d")).not.toBe(before);
  });

  it("follows the target while it slides on hover", () => {
    vi.spyOn(window, "requestAnimationFrame").mockImplementation((callback) => {
      callback(0);
      return 0;
    });
    renderWires(1);
    mockPoints(100, 400);
    startHomeWires();
    const path = document.querySelector("path[data-home-wire]");
    const before = path?.getAttribute("d");

    mockPoints(180, 400);
    const target = document.querySelector("span[data-wire-landing]");
    target?.dispatchEvent(new Event("pointerover", { bubbles: true }));

    expect(path?.getAttribute("d")).not.toBe(before);
    expect(path?.getAttribute("d")).toContain("180,400");
  });
});
