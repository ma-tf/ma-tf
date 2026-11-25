import { grainRect } from "@features/crt/triads";
import { describe, expect, it } from "vite-plus/test";

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
