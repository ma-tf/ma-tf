import { gradientLine } from "@features/crt/effects";
import { describe, expect, it } from "vite-plus/test";

describe("gradientLine", () => {
  it("runs a 180deg gradient from the top edge to the bottom edge", () => {
    const line = gradientLine(180, { width: 200, height: 100 });

    expect(line.x0).toBeCloseTo(100);
    expect(line.y0).toBeCloseTo(0);
    expect(line.x1).toBeCloseTo(100);
    expect(line.y1).toBeCloseTo(100);
  });

  it("runs a 90deg gradient from the left edge to the right edge", () => {
    const line = gradientLine(90, { width: 200, height: 100 });

    expect(line.x0).toBeCloseTo(0);
    expect(line.y0).toBeCloseTo(50);
    expect(line.x1).toBeCloseTo(200);
    expect(line.y1).toBeCloseTo(50);
  });

  it("sizes an angled gradient so its ends touch the corners, as CSS does", () => {
    const box = { width: 300, height: 200 };
    const line = gradientLine(112, box);
    const radians = (112 * Math.PI) / 180;
    const length =
      Math.abs(box.width * Math.sin(radians)) + Math.abs(box.height * Math.cos(radians));

    expect(Math.hypot(line.x1 - line.x0, line.y1 - line.y0)).toBeCloseTo(length);
    expect(line.x0).toBeLessThan(line.x1);
    expect(line.y0).toBeLessThan(line.y1);
  });
});
