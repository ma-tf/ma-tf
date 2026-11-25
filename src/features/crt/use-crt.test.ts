import { baseName } from "@features/crt/use-crt";
import { describe, expect, it } from "vite-plus/test";

describe("baseName", () => {
  it("drops the final extension", () => {
    expect(baseName("photo.png")).toBe("photo");
    expect(baseName("holiday.final.jpeg")).toBe("holiday.final");
  });

  it("falls back to image when nothing is left", () => {
    expect(baseName(".png")).toBe("image");
  });
});
