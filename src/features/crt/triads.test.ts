// @vitest-environment happy-dom
import { grainRect, sampleIndex, tone, triadCentre, triadGrid } from "@features/crt/triads";
import { describe, expect, it } from "vite-plus/test";

describe("tone", () => {
  it("clamps to the 0–255 range", () => {
    expect(tone(0, 0)).toBe(0);
    expect(tone(255, 255)).toBe(255);
    expect(tone(400, 400)).toBe(255);
    expect(tone(-50, -50)).toBe(0);
  });

  it("splits the contrast at 128", () => {
    const below = tone(100, 100);
    const toned = 100 * 1.05 + (100 / 255) ** 4 * 70;

    expect(below).toBeCloseTo(128 + (toned - 128) * 1.35);
    expect(tone(200, 200)).toBe(255);
    const above = tone(140, 140);
    const raised = 140 * 1.05 + (140 / 255) ** 4 * 70;
    expect(above).toBeCloseTo(128 + (raised - 128) * 1.2);
  });
});

describe("sampleIndex", () => {
  const grid = triadGrid(30, 20, 1);

  it("maps a point to the nearest sample", () => {
    expect(sampleIndex(4, 2, grid)).toBe((1 * grid.sampleColumns + 2) * 4);
  });

  it("clamps points outside the sample grid to its edges", () => {
    expect(sampleIndex(-40, -40, grid)).toBe(0);
    expect(sampleIndex(1000, 1000, grid)).toBe(
      ((grid.sampleRows - 1) * grid.sampleColumns + grid.sampleColumns - 1) * 4,
    );
  });
});

describe("triadGrid", () => {
  it("lays triads on a 6px cell scaled by the pixel scale", () => {
    const grid = triadGrid(300, 200, 2);

    expect(grid.cell).toBe(12);
    expect(grid.pitch).toBe(4);
    expect(grid.width).toBe(600);
    expect(grid.height).toBe(400);
    expect(grid.sampleColumns).toBe(150);
  });

  it("staggers even rows by half a cell", () => {
    expect(triadCentre(0, 0, 6).x - triadCentre(1, 0, 6).x).toBe(3);
  });
});

describe("grainRect", () => {
  it("covers the sample grid and centres the grain", () => {
    expect(grainRect(200, 100, { width: 100, height: 100 })).toEqual({
      x: 0,
      y: -50,
      width: 200,
      height: 200,
    });
  });
});
