import {
  SPHERE_START_ANGLE,
  orientPoint,
  projectPoint,
  sphereStrokes,
  swayCamera,
} from "@lib/sphere-geometry";
import { describe, expect, it } from "vite-plus/test";

describe("sphere geometry", () => {
  it("keeps a constant stroke count across a full turn", () => {
    const base = sphereStrokes(0);
    expect(base.length).toBeGreaterThan(0);
    for (const theta of [0.5, 1, Math.PI, 4.2, Math.PI * 2]) {
      expect(sphereStrokes(theta)).toHaveLength(base.length);
    }
  });

  it("preserves unit radius under orientation", () => {
    for (const theta of [0, 0.7, 2.1, 5.9]) {
      const [x, y, z] = orientPoint([0.6, 0.8, 0], theta);
      expect(Math.hypot(x, y, z)).toBeCloseTo(1, 10);
    }
  });

  it("culls points behind the camera", () => {
    expect(projectPoint([0, 0, -1])).toBeNull();
    expect(projectPoint([0, 0, 1])).not.toBeNull();
  });

  it("returns to its start after a full turn", () => {
    expect(sphereStrokes(Math.PI * 2)).toEqual(sphereStrokes(0));
    expect(sphereStrokes(SPHERE_START_ANGLE + Math.PI * 2)).toEqual(
      sphereStrokes(SPHERE_START_ANGLE),
    );
  });

  it("moves the camera with the sway clock", () => {
    const [x0, y0] = swayCamera(0);
    const [x1, y1] = swayCamera(20_000);
    expect(x0).not.toBe(x1);
    expect(y0).not.toBe(y1);
    expect(sphereStrokes(0, x1, y1)).not.toEqual(sphereStrokes(0, x0, y0));
  });

  it("pins the poles while meridians sweep in axial mode", () => {
    for (const theta of [0, 0.9, 2.4]) {
      const [x, y, z] = orientPoint([0, 1, 0], theta);
      const [ex, ey, ez] = orientPoint([0, 1, 0], 0);
      expect(x).toBeCloseTo(ex, 10);
      expect(y).toBeCloseTo(ey, 10);
      expect(z).toBeCloseTo(ez, 10);
    }
    const sweep = sphereStrokes(0).join(" ") === sphereStrokes(1.1).join(" ");
    expect(sweep).toBe(false);
  });
});
