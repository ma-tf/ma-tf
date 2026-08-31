const BASE_ANGLE = -Math.PI / 2;
const FLATNESS = 0.62;
const THUMB_RADIUS = 6;

type OrbitScrollbarProps = {
  rotation: number;
  totalSpan: number;
  radius: number;
  startRad: number;
  arcSize: number;
  offset: number;
};

export function OrbitScrollbar({
  rotation,
  totalSpan,
  radius,
  startRad,
  arcSize,
  offset,
}: OrbitScrollbarProps) {
  const trackRadius = radius + offset;
  const rx = trackRadius;
  const ry = trackRadius * FLATNESS;

  const progress = (((rotation % totalSpan) + totalSpan) % totalSpan) / totalSpan;
  const thumbAngle = BASE_ANGLE + startRad + progress * arcSize;
  const thumbX = Math.cos(thumbAngle) * rx;
  const thumbY = Math.sin(thumbAngle) * ry;

  const startAngle = BASE_ANGLE + startRad;
  const endAngle = BASE_ANGLE + startRad + arcSize;
  const startX = Math.cos(startAngle) * rx;
  const startY = Math.sin(startAngle) * ry;
  const endX = Math.cos(endAngle) * rx;
  const endY = Math.sin(endAngle) * ry;

  const largeArc = arcSize > Math.PI ? 1 : 0;
  const pathD = `M ${startX} ${startY} A ${rx} ${ry} 0 ${largeArc} 1 ${endX} ${endY}`;

  return (
    <svg
      className="pointer-events-none absolute inset-0"
      aria-hidden
      style={{ overflow: "visible" }}
    >
      <path d={pathD} fill="none" stroke="var(--border)" strokeWidth={1.5} opacity={0.4} />
      <circle cx={thumbX} cy={thumbY} r={THUMB_RADIUS} fill="var(--foreground)" />
    </svg>
  );
}
