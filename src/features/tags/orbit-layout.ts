import { BASE_ANGLE } from "@features/tags/orbit-engine";

export type Position = {
  x: number;
  y: number;
  scale: number;
  opacity: number;
  zIndex: number;
};

type OrbitLayoutConfig = {
  flatness: number;
  scaleBack: number;
  scaleRange: number;
  opacityBack: number;
  opacityRange: number;
};

const DEFAULT_LAYOUT_CONFIG: OrbitLayoutConfig = {
  flatness: 0.62,
  scaleBack: 0.6,
  scaleRange: 0.6,
  opacityBack: 0.35,
  opacityRange: 0.65,
};

export function computePositions(
  n: number,
  radius: number,
  arcSize: number,
  startAngle: number,
  angle: number,
  config: OrbitLayoutConfig = DEFAULT_LAYOUT_CONFIG,
): Position[] {
  const positions: Position[] = [];
  for (let i = 0; i < n; i++) {
    const raw = (i / n) * arcSize + angle;
    const wrapped = ((raw % arcSize) + arcSize) % arcSize;
    const a = BASE_ANGLE + startAngle + wrapped;
    const x = radius * Math.cos(a);
    const y = radius * config.flatness * Math.sin(a);
    const depth = (Math.sin(a) + 1) / 2;
    const scale = config.scaleBack + config.scaleRange * depth;
    const opacity = config.opacityBack + config.opacityRange * depth;
    const wraps = Math.floor(raw / arcSize);
    positions.push({ x, y, scale, opacity, zIndex: Math.round((depth - wraps) * 10) });
  }
  return positions;
}
