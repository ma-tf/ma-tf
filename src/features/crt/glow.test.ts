import type { Canvas2D } from "@features/crt/surface";

import { contrastPixels, softGlowSize, supportsFilter } from "@features/crt/glow";
import { describe, expect, it } from "vite-plus/test";

describe("supportsFilter", () => {
  it("detects a context that keeps its filter", () => {
    const context = { filter: "none" } as Canvas2D;

    expect(supportsFilter(context)).toBe(true);
    expect(context.filter).toBe("none");
  });

  it("detects a context without filter support", () => {
    expect(supportsFilter({} as Canvas2D)).toBe(false);
  });

  it("detects a context that ignores the filter it is given", () => {
    const context = {
      get filter() {
        return "none";
      },
      set filter(_value: string) {},
    } as unknown as Canvas2D;

    expect(supportsFilter(context)).toBe(false);
  });
});

describe("contrastPixels", () => {
  it("pushes colour channels away from mid-grey and leaves alpha alone", () => {
    const data = new Uint8ClampedArray([128, 100, 200, 77, 0, 255, 140, 255]);

    contrastPixels(data, 1.9);

    expect(Array.from(data)).toEqual([128, 75, 255, 77, 0, 255, 151, 255]);
  });
});

describe("softGlowSize", () => {
  it("shrinks by twice the blur radius so upscaling blurs", () => {
    expect(softGlowSize(900, 600, 3)).toEqual({ width: 150, height: 100 });
  });

  it("keeps the size when the blur is under a pixel", () => {
    expect(softGlowSize(900, 600, 0.4)).toEqual({ width: 900, height: 600 });
    expect(softGlowSize(900, 600, 0.5)).toEqual({ width: 900, height: 600 });
  });
});
