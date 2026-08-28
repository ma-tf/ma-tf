import { frontIndexFor } from "@features/tags/orbit-engine";

type OrbitIntent =
  | { type: "nudge"; delta: number }
  | { type: "activate" }
  | { type: "back" }
  | { type: "none" };

export function decideKeyIntent(key: string, selected: boolean): OrbitIntent {
  if (key === "ArrowLeft") return { type: "nudge", delta: -1 };
  if (key === "ArrowRight") return { type: "nudge", delta: 1 };
  if (key === "Enter" || key === " ") return { type: "activate" };
  if (key === "Escape" && selected) return { type: "back" };
  return { type: "none" };
}

export function getActivatedItem<T>(
  rotation: number,
  items: T[],
  n: number,
  arcSize: number,
  startAngle: number,
): T | null {
  const idx = ((frontIndexFor(rotation, n, arcSize, startAngle) % n) + n) % n;
  return items[idx] ?? null;
}
