import { displaySize, exportSize } from "@features/crt/render";
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
