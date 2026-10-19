import { describe, expect, it } from "vite-plus/test";

import type { Option } from "@/scripts/argv.mts";

import { formatHelp, parseArgs, parseNumericFlag, readValue, readValues } from "@/scripts/argv.mts";

const OPTIONS: Option[] = [
  { name: "--runs", placeholder: "<n>", description: "Runs per mode" },
  { name: "--file", placeholder: "<path>", description: "Lint one path" },
  { name: "--timings", description: "Add timings" },
];

const HELP = formatHelp("script [options]", OPTIONS);

describe("formatHelp", () => {
  it("lists the usage line, every option and the help line", () => {
    expect(HELP).toContain("Usage: script [options]");
    expect(HELP).toContain("--runs=<n>");
    expect(HELP).toContain("--file=<path>");
    expect(HELP).toContain("--timings");
    expect(HELP).toContain("--help");
    expect(HELP).toContain("Print this message");
  });
});

describe("parseArgs", () => {
  it("collects repeated values, flags and positionals", () => {
    const args = parseArgs(
      ["page", "--file=a", "--file=b", "--timings", "selector"],
      OPTIONS,
      HELP,
    );

    expect(readValues(args, "--file")).toEqual(["a", "b"]);
    expect(readValue(args, "--file")).toBe("a");
    expect(args.flags.has("--timings")).toBe(true);
    expect(args.positionals).toEqual(["page", "selector"]);
  });

  it("throws for an unknown option", () => {
    expect(() => parseArgs(["--bogus"], OPTIONS, HELP)).toThrow("Unknown option --bogus");
  });

  it("throws when a flag is given a value", () => {
    expect(() => parseArgs(["--timings=1"], OPTIONS, HELP)).toThrow("--timings takes no value");
  });

  it("throws when a value option has no value", () => {
    expect(() => parseArgs(["--runs"], OPTIONS, HELP)).toThrow("--runs needs a value");
  });
});

describe("parseNumericFlag", () => {
  const rule = { fallback: 5, minimum: 1, whole: true };

  it("returns the fallback when the value is missing", () => {
    expect(parseNumericFlag(undefined, "--runs", rule)).toBe(5);
  });

  it("accepts a whole number above the minimum", () => {
    expect(parseNumericFlag("8", "--runs", rule)).toBe(8);
  });

  it("throws for a non-integer when the rule requires a whole number", () => {
    expect(() => parseNumericFlag("2.5", "--runs", rule)).toThrow(
      "--runs needs a positive whole number",
    );
  });

  it("throws below the minimum", () => {
    expect(() => parseNumericFlag("0", "--runs", rule)).toThrow(
      "--runs needs a positive whole number",
    );
  });

  it("throws for a non-numeric string", () => {
    expect(() => parseNumericFlag("many", "--runs", rule)).toThrow(
      "--runs needs a positive whole number",
    );
  });

  it("accepts a fractional number when whole is not set", () => {
    expect(parseNumericFlag("1.5", "--scroll", { fallback: 0, minimum: 0 })).toBe(1.5);
  });
});
