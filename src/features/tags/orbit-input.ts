export function activateAtFront<T>(
  rotation: number,
  items: T[],
  n: number,
  arcSize: number,
  startAngle: number,
  onActivate: (item: T) => void,
): void {
  const step = arcSize / n;
  const idx = Math.round((Math.PI - startAngle - rotation) / step);
  const wrapped = ((idx % n) + n) % n;
  const tag = items[wrapped];
  if (tag) onActivate(tag);
}
