import { crtProjector, projector, tiltMatrix, type Placement } from "@features/crt/project";
import { describe, expect, it } from "vite-plus/test";

const place = (project: ReturnType<typeof projector>, x: number, y: number): Placement => {
  const out = { x: 0, y: 0, scale: 0 };
  project(x, y, out);
  return out;
};

describe("projector", () => {
  it("is the identity with no rotation and no scale", () => {
    const matrix = tiltMatrix({ perspective: 900, rotateX: 0, rotateY: 0, scale: 1 });
    const project = projector(matrix, 600, 400);

    for (const [x, y] of [
      [0, 0],
      [300, 200],
      [600, 400],
      [123, 321],
    ] as const) {
      const out = place(project, x, y);
      expect(out.x).toBeCloseTo(x);
      expect(out.y).toBeCloseTo(y);
      expect(out.scale).toBeCloseTo(1);
    }
  });

  it("keeps the centre in place under the CRT tilt", () => {
    const out = place(crtProjector(600, 400), 300, 200);

    expect(out.x).toBeCloseTo(300);
    expect(out.y).toBeCloseTo(200);
    expect(out.scale).toBeCloseTo(1);
  });

  it("brings the right and bottom edges closer and pushes the left and top away", () => {
    const project = crtProjector(600, 400);
    const topLeft = place(project, 0, 0);
    const topRight = place(project, 600, 0);
    const bottomLeft = place(project, 0, 400);
    const bottomRight = place(project, 600, 400);

    expect(topRight.scale).toBeGreaterThan(topLeft.scale);
    expect(bottomLeft.scale).toBeGreaterThan(topLeft.scale);
    expect(bottomRight.scale).toBeGreaterThan(1);
    expect(topLeft.scale).toBeLessThan(1);
    expect(bottomRight.x).toBeGreaterThan(600);
    expect(bottomRight.y).toBeGreaterThan(400);
    expect(topLeft.x).toBeLessThan(0);
    expect(topLeft.y).toBeLessThan(0);
  });
});
