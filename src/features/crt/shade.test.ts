import type { TriadGrid } from "@features/crt/layout";

import { triadCentre, triadGrid } from "@features/crt/layout";
import { crtHomography, invertHomography } from "@features/crt/project";
import {
  columnSpan,
  discCoverage,
  PIXEL_RADIUS,
  quantise,
  rowSpan,
  sampleCell,
  shadeTriads,
  triadReach,
} from "@features/crt/shade";
import { describe, expect, it } from "vite-plus/test";

describe("discCoverage", () => {
  it("covers a whole pixel deep inside a large disc", () => {
    expect(discCoverage(5, 0)).toBeCloseTo(1);
    expect(discCoverage(5, 3)).toBeCloseTo(1);
  });

  it("covers nothing beyond the disc's edge", () => {
    expect(discCoverage(2, 2 + PIXEL_RADIUS)).toBe(0);
    expect(discCoverage(0, 0)).toBe(0);
  });

  it("covers half a pixel whose centre sits on a long straight edge", () => {
    expect(discCoverage(10_000, 10_000)).toBeCloseTo(0.5, 3);
  });

  it("covers a tiny disc's own area when it sits in the pixel", () => {
    expect(discCoverage(0.2, 0.1)).toBeCloseTo(Math.PI * 0.04);
  });

  it("conserves a disc's area across the pixels around it", () => {
    let total = 0;
    for (let x = -6; x <= 6; x += 1) {
      for (let y = -6; y <= 6; y += 1) total += discCoverage(1.3, Math.hypot(x + 0.31, y - 0.17));
    }
    expect(total).toBeCloseTo(Math.PI * 1.3 ** 2, 1);
  });
});

describe("cell lookup", () => {
  const cell = 6;
  const reach = triadReach(cell);

  it("finds the rows whose triads can reach a point", () => {
    const centre = triadCentre(4, 0, cell);
    const [start, end] = rowSpan(centre.y, cell, reach);

    expect(start).toBeLessThanOrEqual(4);
    expect(end).toBeGreaterThanOrEqual(4);
    expect(end - start).toBeLessThanOrEqual(2);
  });

  it("follows the half-cell stagger on even rows", () => {
    const even = triadCentre(2, 5, cell);
    const odd = triadCentre(3, 5, cell);

    expect(columnSpan(even.x, 2, cell, reach)[0]).toBeLessThanOrEqual(5);
    expect(columnSpan(even.x, 2, cell, reach)[1]).toBeGreaterThanOrEqual(5);
    expect(columnSpan(odd.x, 3, cell, reach)[0]).toBeLessThanOrEqual(5);
    expect(columnSpan(odd.x, 3, cell, reach)[1]).toBeGreaterThanOrEqual(5);
    expect(even.x - odd.x).toBe(cell / 2);
  });
});

describe("sampleCell", () => {
  it("rounds to the nearest sample and clamps to the grid", () => {
    expect(sampleCell(4.9, 2, 10)).toBe(2);
    expect(sampleCell(5, 2, 10)).toBe(3);
    expect(sampleCell(-3, 2, 10)).toBe(0);
    expect(sampleCell(99, 2, 10)).toBe(9);
  });
});

describe("quantise", () => {
  it("rounds half up like CSS colour parsing", () => {
    expect(quantise(127.5)).toBe(128);
    expect(quantise(127.49)).toBe(127);
  });
});

describe("shadeTriads", () => {
  const grid: TriadGrid = triadGrid(120, 90, 1);
  const forward = crtHomography(grid.width);
  const input = {
    layout: grid,
    forward,
    inverse: invertHomography(forward),
    sample: () => [200, 200, 200] as [number, number, number],
  };

  it("lights the pixel under a triad and leaves the margin dark", () => {
    const centre = triadCentre(5, 5, grid.cell);
    const lit = shadeTriads(input, centre.x, centre.y);

    expect(lit[0]).toBeGreaterThan(50);
    expect(shadeTriads(input, 0.5, 0.5)).toEqual([0, 0, 0]);
  });

  it("never exceeds full brightness", () => {
    const bright = { ...input, sample: () => [255, 255, 255] as [number, number, number] };
    for (let x = 30; x < 40; x += 0.5) {
      for (const channel of shadeTriads(bright, x, 40)) expect(channel).toBeLessThanOrEqual(255);
    }
  });
});
