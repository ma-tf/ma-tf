export type Vec3 = readonly [number, number, number];

const VIEW = 500;
const FOCAL = 400;
export const CAM_Y = -0.1;
const CAM_Z = -0.62;
const NEAR = 0.08;
const CLAMP_MIN = -800;
const CLAMP_MAX = 1800;
const DEG_TO_RAD = Math.PI / 180;
const TAU = Math.PI * 2;
const TILT_DEGREES = -15;
const TILT = TILT_DEGREES * DEG_TO_RAD;
const SWAY_X_AMP = 0.03;
const SWAY_Y_AMP = 0.035;
const SWAY_X_PERIOD_MS = 176_000;
const SWAY_Y_PERIOD_MS = 120_000;

const SPHERE_START_DEGREES = 35;

export const SPHERE_START_ANGLE = SPHERE_START_DEGREES * DEG_TO_RAD;

const SAMPLE_STEP_DEGREES = 4;
const FULL_CIRCLE_DEGREES = 360;
const MERIDIANS_EACH_SIDE = 9;
const MERIDIAN_STEP_DEGREES = 10;
const MERIDIAN_CENTER_DEGREES = 90;
const PARALLEL_MIN_DEGREES = -75;
const PARALLEL_MAX_DEGREES = 75;
const PARALLEL_STEP_DEGREES = 10;
const CHUNKS_PER_CIRCLE = 8;
const COORDINATE_PRECISION = 10;

function clamp(v: number) {
  return Math.min(CLAMP_MAX, Math.max(CLAMP_MIN, v));
}

function quantize(v: number) {
  return Math.round(v * COORDINATE_PRECISION) / COORDINATE_PRECISION;
}

function tiltPoint([x, y, z]: Vec3): Vec3 {
  const cos = Math.cos(TILT);
  const sin = Math.sin(TILT);
  return [x * cos - y * sin, x * sin + y * cos, z];
}

export function orientPoint(point: Vec3, theta: number): Vec3 {
  return tiltPoint(yawPoint(point, theta));
}

function yawPoint([x, y, z]: Vec3, theta: number): Vec3 {
  const cos = Math.cos(theta);
  const sin = Math.sin(theta);
  return [x * cos + z * sin, y, z * cos - x * sin];
}

export function projectPoint(
  [x, y, z]: Vec3,
  camX = 0,
  camY = CAM_Y,
): readonly [number, number] | null {
  const depth = z - CAM_Z;
  if (depth < NEAR) return null;
  return [
    quantize(clamp(VIEW + (FOCAL * (x - camX)) / depth)),
    quantize(clamp(VIEW - (FOCAL * (y - camY)) / depth)),
  ];
}

export function swayCamera(elapsedMs: number): readonly [number, number] {
  return [
    SWAY_X_AMP * Math.sin((elapsedMs / SWAY_X_PERIOD_MS) * TAU),
    CAM_Y + SWAY_Y_AMP * Math.sin((elapsedMs / SWAY_Y_PERIOD_MS) * TAU),
  ];
}

function meridianCircle(azimuth: number): Vec3[] {
  const points: Vec3[] = [];
  for (let a = 0; a <= FULL_CIRCLE_DEGREES; a += SAMPLE_STEP_DEGREES) {
    const rad = a * DEG_TO_RAD;
    points.push([
      Math.sin(rad) * Math.cos(azimuth),
      Math.cos(rad),
      Math.sin(rad) * Math.sin(azimuth),
    ]);
  }
  return points;
}

function parallelCircle(lat: number): Vec3[] {
  const rad = lat * DEG_TO_RAD;
  const r = Math.cos(rad);
  const h = Math.sin(rad);
  const points: Vec3[] = [];
  for (let t = 0; t <= FULL_CIRCLE_DEGREES; t += SAMPLE_STEP_DEGREES) {
    const angle = t * DEG_TO_RAD;
    points.push([r * Math.cos(angle), h, r * Math.sin(angle)]);
  }
  return points;
}

function split(points: Vec3[], parts: number): Vec3[][] {
  const out: Vec3[][] = [];
  for (let i = 0; i < parts; i++) {
    const start = Math.round((i * (points.length - 1)) / parts);
    const end = Math.round(((i + 1) * (points.length - 1)) / parts);
    out.push(points.slice(start, end + 1));
  }
  return out;
}

const STROKES: Vec3[][] = (() => {
  const strokes: Vec3[][] = [];
  for (let k = -MERIDIANS_EACH_SIDE; k <= MERIDIANS_EACH_SIDE; k++) {
    const circle = meridianCircle(
      (MERIDIAN_CENTER_DEGREES + k * MERIDIAN_STEP_DEGREES) * DEG_TO_RAD,
    );
    strokes.push(...split(circle, CHUNKS_PER_CIRCLE));
  }
  for (let lat = PARALLEL_MIN_DEGREES; lat <= PARALLEL_MAX_DEGREES; lat += PARALLEL_STEP_DEGREES) {
    const circle = parallelCircle(lat);
    strokes.push(...split(circle, CHUNKS_PER_CIRCLE));
  }
  return strokes;
})();

export function sphereStrokes(theta: number, camX = 0, camY = CAM_Y): string[] {
  return STROKES.map((stroke) => {
    const runs: string[] = [];
    let current: string[] = [];
    for (const point of stroke) {
      const projected = projectPoint(orientPoint(point, theta), camX, camY);
      if (projected === null) {
        if (current.length > 1) runs.push(`M ${current.join(" L ")}`);
        current = [];
        continue;
      }
      current.push(`${projected[0]} ${projected[1]}`);
    }
    if (current.length > 1) runs.push(`M ${current.join(" L ")}`);
    return runs.join(" ");
  });
}
