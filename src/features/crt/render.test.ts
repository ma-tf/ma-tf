import { cellSize, displaySize, exportSize, flatWidth } from "@features/crt/render";
import { describe, expect, it } from "vite-plus/test";

describe("exportSize", () => {
  it("exports at three times the natural size", () => {
    expect(exportSize(400, 300)).toEqual({ width: 1200, height: 900 });
  });

  it("caps the longest side at 6000px", () => {
    expect(exportSize(4000, 3000)).toEqual({ width: 6000, height: 4500 });
    expect(exportSize(1000, 3000)).toEqual({ width: 2000, height: 6000 });
  });
});

describe("displaySize", () => {
  it("shows the composition at three times the natural size when it fits", () => {
    expect(displaySize(200, 100, { width: 1000, height: 1000 })).toEqual({
      width: 600,
      height: 300,
    });
  });

  it("fits the composition into the available width", () => {
    expect(displaySize(800, 600, { width: 358, height: 1000 })).toEqual({
      width: 358,
      height: 269,
    });
  });

  it("fits the composition into the available height", () => {
    expect(displaySize(480, 320, { width: 1056, height: 500 })).toEqual({
      width: 750,
      height: 500,
    });
  });
});

describe("cellSize", () => {
  it("keeps the source density at one triad per two source pixels", () => {
    expect(cellSize(15600, "source")).toBe(6);
    expect(cellSize(600, "source")).toBe(6);
  });

  it("caps the fixed density at about 400 triads across", () => {
    expect(cellSize(15600, "fixed")).toBe(39);
    expect(15600 / cellSize(15600, "fixed")).toBe(400);
  });

  it("never makes fixed triads smaller than source triads", () => {
    expect(cellSize(1200, "fixed")).toBe(6);
  });
});

describe("flatWidth", () => {
  it("renders at the output size when its triads are already resolved", () => {
    expect(flatWidth(1056, 1200, 6)).toBe(1056);
    expect(flatWidth(700, 15600, 39)).toBe(1600);
  });

  it("supersamples so each source triad spans at least four pixels", () => {
    expect(flatWidth(326, 6750, 6)).toBe(4096);
    expect(flatWidth(326, 3000, 6)).toBe(2000);
  });

  it("caps supersampling at 4096 pixels but never goes below the output", () => {
    expect(flatWidth(700, 15600, 6)).toBe(4096);
    expect(flatWidth(6000, 15600, 6)).toBe(6000);
  });
});
