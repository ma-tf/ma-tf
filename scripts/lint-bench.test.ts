import { describe, expect, it } from "vite-plus/test";

import { formatTimings, median } from "@/scripts/lint-bench.mts";

const OUTPUT = [
  "vp lint",
  "",
  "Rule timings:",
  "Rule                              Time    Share  Calls  Source",
  "--------------------------------  ------  -----  -----  --------",
  "typescript/no-explicit-any        12.0ms  40.0%  120    native",
  "react/no-array-index-key          5.0ms   16.7%  50     js-plugin",
  "no-console                        2.0ms   6.7%   20     native",
  "unicorn/prefer-number-properties  1.5ms   5.0%   15     native",
  "",
  "JS plugin runtime: 12.3ms",
  "  react: 8.1ms",
].join("\n");

describe("median", () => {
  it("returns the middle value for an odd-length array", () => {
    expect(median([3, 1, 2])).toBe(2);
  });

  it("averages the two middle values for an even-length array", () => {
    expect(median([4, 1, 3, 2])).toBe(2.5);
  });

  it("returns zero for an empty array", () => {
    expect(median([])).toBe(0);
  });

  it("returns the only value for a single-element array", () => {
    expect(median([7])).toBe(7);
  });
});

describe("formatTimings", () => {
  it("keeps the header, trims rows to top and appends the runtime summary", () => {
    const result = formatTimings(OUTPUT, 2);

    expect(result).toBeDefined();
    expect(result).toContain("Rule timings:");
    expect(result).toContain("Rule                              Time");
    expect(result).toContain("typescript/no-explicit-any");
    expect(result).toContain("react/no-array-index-key");
    expect(result).not.toContain("no-console");
    expect(result).toContain("... 2 more rows");
    expect(result).toContain("JS plugin runtime: 12.3ms");
    expect(result).toContain("react: 8.1ms");
  });

  it("returns undefined when the output has no timings table", () => {
    expect(formatTimings("vp lint\n\nNo problems found", 5)).toBeUndefined();
  });
});
