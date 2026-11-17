import {
  createRandom,
  DEFAULT_PLACEMENT,
  hashSeed,
  planFragment,
  planFragments,
  seedFromHash,
  slotOrder,
} from "@lib/fragment-placement";
import { describe, expect, it } from "vite-plus/test";

const DESKTOP = { width: 1440, height: 900 };

describe("seed helpers", () => {
  it("hashes the same input to the same seed", () => {
    expect(hashSeed("42")).toBe(hashSeed("42"));
    expect(hashSeed("42")).not.toBe(hashSeed("43"));
  });

  it("prefers the seed hash over the clock", () => {
    expect(seedFromHash("#seed=42", 1)).toBe(seedFromHash("#seed=42", 999));
    expect(seedFromHash("#seed=42", 1)).not.toBe(seedFromHash("#seed=43", 1));
  });

  it("falls back to the clock when the hash is absent", () => {
    expect(seedFromHash("", 1)).toBe(seedFromHash("", 1));
    expect(seedFromHash("", 1)).not.toBe(seedFromHash("", 2));
  });
});

describe("createRandom", () => {
  it("repeats a sequence for a seed and stays below one", () => {
    const first = createRandom(42);
    const second = createRandom(42);
    const values = Array.from({ length: 8 }, () => first());

    expect(values).toEqual(Array.from({ length: 8 }, () => second()));
    for (const value of values) {
      expect(value).toBeGreaterThanOrEqual(0);
      expect(value).toBeLessThan(1);
    }
  });
});

describe("planFragments", () => {
  it("repeats a plan for a seed and changes it for another", () => {
    expect(planFragments(42, DESKTOP, [])).toEqual(planFragments(42, DESKTOP, []));
    expect(planFragments(42, DESKTOP, [])).not.toEqual(planFragments(43, DESKTOP, []));
  });

  it("places up to three boxes inside the gutter", () => {
    const placements = planFragments(42, DESKTOP, []);

    expect(placements).toHaveLength(3);
    for (const placement of placements) {
      expect(placement.x).toBeGreaterThanOrEqual(DEFAULT_PLACEMENT.edge);
      expect(placement.y).toBeGreaterThanOrEqual(DEFAULT_PLACEMENT.edge);
      expect(placement.x + DEFAULT_PLACEMENT.width).toBeLessThanOrEqual(
        DESKTOP.width - DEFAULT_PLACEMENT.edge,
      );
      expect(placement.y + DEFAULT_PLACEMENT.height).toBeLessThanOrEqual(
        DESKTOP.height - DEFAULT_PLACEMENT.edge,
      );
    }
  });

  it("rejects the reserved boxes with their padding", () => {
    const reserved = [{ x: 0, y: 0, width: 800, height: 900 }];
    const placements = planFragments(42, DESKTOP, reserved);

    for (const placement of placements) {
      expect(placement.x).toBeGreaterThanOrEqual(800 + DEFAULT_PLACEMENT.reservedGap);
    }
  });

  it("keeps placements apart from each other", () => {
    const placements = planFragments(42, DESKTOP, []);

    for (const [index, first] of placements.entries()) {
      for (const second of placements.slice(index + 1)) {
        const apart =
          first.x + DEFAULT_PLACEMENT.width + DEFAULT_PLACEMENT.fragmentGap <= second.x ||
          second.x + DEFAULT_PLACEMENT.width + DEFAULT_PLACEMENT.fragmentGap <= first.x ||
          first.y + DEFAULT_PLACEMENT.height + DEFAULT_PLACEMENT.fragmentGap <= second.y ||
          second.y + DEFAULT_PLACEMENT.height + DEFAULT_PLACEMENT.fragmentGap <= first.y;
        expect(apart).toBe(true);
      }
    }
  });

  it("honours a limit and returns nothing when the space cannot hold a box", () => {
    expect(planFragments(42, DESKTOP, [], 1)).toHaveLength(1);
    expect(planFragments(42, { width: 200, height: 100 }, [])).toEqual([]);
    expect(planFragments(42, DESKTOP, [{ x: 0, y: 0, width: 1440, height: 900 }])).toEqual([]);
  });
});

describe("planFragment", () => {
  it("returns one box clear of the reserved space and blockers", () => {
    const box = planFragment(42, DESKTOP, [{ x: 0, y: 0, width: 720, height: 900 }], []);

    if (!box) throw new Error("expected a placement");
    expect(box.x).toBeGreaterThanOrEqual(720 + DEFAULT_PLACEMENT.reservedGap);
    expect(box.y).toBeGreaterThanOrEqual(DEFAULT_PLACEMENT.edge);
  });

  it("repeats for a seed and returns nothing when the space cannot hold a box", () => {
    expect(planFragment(42, DESKTOP, [])).toEqual(planFragment(42, DESKTOP, []));
    expect(planFragment(42, { width: 200, height: 100 }, [])).toBeUndefined();
  });
});

describe("slotOrder", () => {
  it("returns every slot once and repeats for a seed", () => {
    const first = slotOrder(42, 6);
    const second = slotOrder(42, 6);

    expect(first).toEqual(second);
    expect([...first].sort((a, b) => a - b)).toEqual([0, 1, 2, 3, 4, 5]);
  });
});
