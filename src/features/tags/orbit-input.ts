import { frontIndexFor } from "@features/tags/orbit-engine";

type OrbitIntent =
  | { type: "nudge"; delta: number }
  | { type: "activate" }
  | { type: "back" }
  | { type: "none" };

const KEY_INTENTS: Record<string, OrbitIntent> = {
  ArrowLeft: { type: "nudge", delta: -1 },
  ArrowRight: { type: "nudge", delta: 1 },
  Enter: { type: "activate" },
  " ": { type: "activate" },
};

export function decideKeyIntent(key: string): OrbitIntent {
  return KEY_INTENTS[key] ?? { type: "none" };
}

export function activateAtFront<T>(
  getRotation: () => number,
  items: T[],
  n: number,
  arcSize: number,
  startAngle: number,
  onActivate: (item: T) => void,
): void {
  const rotation = getRotation();
  const tag = getActivatedItem(rotation, items, n, arcSize, startAngle);
  if (tag) onActivate(tag);
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
