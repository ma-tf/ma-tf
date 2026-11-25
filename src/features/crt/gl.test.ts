import type { Surface } from "@features/crt/surface";

import { blurTaps, createTriadGl, fitsLimits } from "@features/crt/gl";
import { describe, expect, it, vi } from "vite-plus/test";

describe("fitsLimits", () => {
  const limits = { texture: 8192, renderbuffer: 16384, viewport: 8192 };

  it("accepts sizes within the smallest GPU limit", () => {
    expect(fitsLimits(limits, [6000, 5333, 7800, 6933])).toBe(true);
  });

  it("rejects a size beyond any limit, and empty sizes", () => {
    expect(fitsLimits(limits, [8193, 100])).toBe(false);
    expect(fitsLimits({ ...limits, viewport: 4096 }, [6000])).toBe(false);
    expect(fitsLimits(limits, [0])).toBe(false);
  });
});

describe("blurTaps", () => {
  it("reaches three standard deviations", () => {
    expect(blurTaps(1)).toBe(3);
    expect(blurTaps(0.79)).toBe(3);
    expect(blurTaps(3)).toBe(9);
  });
});

describe("createTriadGl", () => {
  it("returns nothing when WebGL2 is unavailable, so rendering falls back to 2D", () => {
    const getContext = vi.fn(() => null);
    const surface = {
      width: 1,
      height: 1,
      getContext,
      addEventListener: vi.fn(),
    } as unknown as Surface;

    expect(createTriadGl(() => surface)).toBeNull();
    expect(getContext).toHaveBeenCalledWith(
      "webgl2",
      expect.objectContaining({ antialias: false }),
    );
  });
});
