import type { Position } from "@features/tags/orbit-layout";

export function applyPositions(
  refs: React.RefObject<(HTMLAnchorElement | null)[]>,
  positions: Position[],
): void {
  for (let i = 0; i < positions.length; i++) {
    const el = refs.current[i];
    const pos = positions[i];
    if (!el || !pos) continue;
    const { x, y, scale, opacity, zIndex } = pos;
    el.style.transform = `translate(-50%, -50%) translate(${x}px, ${y}px) scale(${scale})`;
    el.style.opacity = String(opacity);
    el.style.zIndex = String(zIndex);
  }
}
