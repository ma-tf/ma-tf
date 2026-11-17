export type FragmentSize = {
  width: number;
  height: number;
};

export type FragmentBox = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export type PlacementOptions = {
  width: number;
  height: number;
  edge: number;
  candidateStep: number;
  reservedGap: number;
  fragmentGap: number;
};

export const DEFAULT_PLACEMENT: PlacementOptions = {
  width: 224,
  height: 96,
  edge: 24,
  candidateStep: 32,
  reservedGap: 24,
  fragmentGap: 48,
};

const MAX_FRAGMENTS = 3;

export function hashSeed(input: string) {
  let hash = 2166136261;
  for (let index = 0; index < input.length; index += 1) {
    hash ^= input.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

export function seedFromHash(hash: string, now: number) {
  const match = /^#seed=([^&]+)/.exec(hash);
  return hashSeed(match?.[1] ?? String(now));
}

export function createRandom(seed: number) {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let value = state;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

function shuffle<T>(items: T[], random: () => number) {
  for (let index = items.length - 1; index > 0; index -= 1) {
    const other = Math.floor(random() * (index + 1));
    const current = items[index];
    const target = items[other];
    if (current === undefined || target === undefined) continue;
    items[index] = target;
    items[other] = current;
  }
  return items;
}

export function slotOrder(seed: number, count: number) {
  return shuffle(
    Array.from({ length: count }, (_, index) => index),
    createRandom(seed),
  );
}

function candidateBoxes(size: FragmentSize, options: PlacementOptions): FragmentBox[] {
  const lastX = size.width - options.width - options.edge;
  const lastY = size.height - options.height - options.edge;
  if (lastX < options.edge || lastY < options.edge) return [];

  const boxes: FragmentBox[] = [];
  for (let y = options.edge; y <= lastY; y += options.candidateStep) {
    for (let x = options.edge; x <= lastX; x += options.candidateStep) {
      boxes.push({ x, y, width: options.width, height: options.height });
    }
  }
  return boxes;
}

function intersects(first: FragmentBox, second: FragmentBox, gap: number) {
  return (
    first.x < second.x + second.width + gap &&
    first.x + first.width + gap > second.x &&
    first.y < second.y + second.height + gap &&
    first.y + first.height + gap > second.y
  );
}

export function planFragments(
  seed: number,
  size: FragmentSize,
  reserved: FragmentBox[],
  limit = MAX_FRAGMENTS,
  options: PlacementOptions = DEFAULT_PLACEMENT,
): FragmentBox[] {
  const candidates = shuffle(candidateBoxes(size, options), createRandom(seed));
  const chosen: FragmentBox[] = [];

  for (const box of candidates) {
    if (chosen.length === limit) break;
    if (reserved.some((rect) => intersects(box, rect, options.reservedGap))) continue;
    if (chosen.some((rect) => intersects(box, rect, options.fragmentGap))) continue;
    chosen.push(box);
  }

  return chosen;
}

export function planFragment(
  seed: number,
  size: FragmentSize,
  reserved: FragmentBox[],
  blockers: FragmentBox[] = [],
  options: PlacementOptions = DEFAULT_PLACEMENT,
): FragmentBox | undefined {
  const candidates = shuffle(candidateBoxes(size, options), createRandom(seed));
  return candidates.find(
    (box) =>
      !reserved.some((rect) => intersects(box, rect, options.reservedGap)) &&
      !blockers.some((rect) => intersects(box, rect, options.fragmentGap)),
  );
}
