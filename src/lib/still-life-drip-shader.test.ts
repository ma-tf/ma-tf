// @vitest-environment happy-dom
import {
  dripFieldAt,
  resolveContentBox,
  resolveGeometry,
  startStillLifeDripShader,
  type DripGeometry,
} from "@lib/still-life-drip-shader";
import { beforeEach, describe, expect, it } from "vite-plus/test";

const geometry: DripGeometry = resolveGeometry({
  clientWidth: 192,
  clientHeight: 264,
});

beforeEach(() => {
  document.body.innerHTML = "";
});

describe("resolveGeometry", () => {
  it("maps image-space constants into the canvas box", () => {
    expect(geometry.anchorX).toBeCloseTo(81, 5);
    expect(geometry.anchorY).toBeCloseTo(54, 5);
    expect(geometry.floorY).toBeCloseTo(198, 5);
    expect(geometry.dropR).toBe(3);
  });
});

describe("resolveContentBox", () => {
  it("letterboxes contain above the mobile breakpoint", () => {
    const box = resolveContentBox(1240, 940, false);
    expect(box.scale).toBeCloseTo(0.62, 5);
    expect(box.originX).toBe(0);
    expect(box.originY).toBeCloseTo(5, 5);
  });

  it("fills height under portrait cover", () => {
    const box = resolveContentBox(390, 844, true);
    expect(box.scale).toBeCloseTo(844 / 1500, 5);
    expect(box.originY).toBeCloseTo(0, 5);
  });

  it("overflows vertically centred under landscape cover", () => {
    const box = resolveContentBox(844, 390, true);
    expect(box.scale).toBeCloseTo(844 / 2000, 5);
    expect(box.originY).toBeCloseTo(-121.5, 5);
  });
});

describe("dripFieldAt", () => {
  it("is inactive before the cycle and after the splash", () => {
    expect(dripFieldAt(-100, geometry).active).toBe(false);
    expect(dripFieldAt(2950, geometry).active).toBe(false);
    expect(dripFieldAt(8499, geometry).active).toBe(false);
    expect(dripFieldAt(0, geometry).active).toBe(true);
  });

  it("swells the drop during the form phase", () => {
    const early = dripFieldAt(60, geometry);
    const mid = dripFieldAt(450, geometry);
    expect(early.dropR).toBeLessThan(mid.dropR);
    expect(mid.dropR).toBeLessThan(geometry.dropR);
    expect(early.alpha).toBeLessThan(1);
  });

  it("hangs at full size attached to the cap", () => {
    const state = dripFieldAt(1250, geometry);
    expect(state.dropR).toBeCloseTo(geometry.dropR, 5);
    expect(state.neck).toBe(1);
    expect(state.ripple).toBe(0);
    expect(state.alpha).toBe(1);
  });

  it("thins the neck while sagging", () => {
    const state = dripFieldAt(1775, geometry);
    expect(state.neck).toBeGreaterThan(0);
    expect(state.neck).toBeLessThan(1);
    expect(state.dropY).toBeGreaterThan(geometry.anchorY + geometry.dropR * 0.82);
  });

  it("falls monotonically and reaches the floor", () => {
    let previous = -Infinity;
    for (let t = 1950; t <= 2400; t += 30) {
      const dropY = dripFieldAt(t, geometry).dropY;
      expect(dropY).toBeGreaterThan(previous);
      previous = dropY;
    }
    const impact = dripFieldAt(2400, geometry);
    expect(impact.dropY).toBeCloseTo(geometry.floorY - geometry.dropR * 0.62, 5);
  });

  it("splashes with a ripple and fading specks", () => {
    const early = dripFieldAt(2500, geometry);
    expect(early.ripple).toBeGreaterThan(0);
    expect(early.ripple).toBeLessThan(1);
    expect(early.specks).toHaveLength(3);
    for (const speck of early.specks) {
      expect(speck.alpha).toBeGreaterThan(0);
      expect(speck.alpha).toBeLessThanOrEqual(1);
    }
    const late = dripFieldAt(2900, geometry);
    expect(late.ripple).toBeGreaterThan(0.9);
    expect(late.alpha).toBe(0);
    for (const speck of late.specks) {
      expect(speck.alpha).toBeLessThan(0.1);
    }
  });
});

describe("startStillLifeDripShader", () => {
  it("does nothing without a canvas", () => {
    expect(() => startStillLifeDripShader()).not.toThrow();
  });

  it("does not throw when the browser offers no WebGL", () => {
    const canvas = document.createElement("canvas");
    canvas.setAttribute("data-still-life-drip-canvas", "");
    document.body.append(canvas);
    expect(() => startStillLifeDripShader()).not.toThrow();
  });
});
