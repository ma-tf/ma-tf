import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vite-plus/test";

const sourceRoot = fileURLToPath(new URL("../../", import.meta.url));
const sourceExtension = /\.(astro|ts|tsx)$/;
const testFile = /\.test\.tsx?$/;
const queryReaders = [/\bsearchParams\b/, /\bURLSearchParams\b/, /\.search\b/];

function sourceFiles(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);

    if (entry.isDirectory()) return sourceFiles(path);
    if (!sourceExtension.test(entry.name) || testFile.test(entry.name)) return [];

    return [path];
  });
}

describe("discovery cache key", () => {
  it("has no server-side query parameters to vary on", () => {
    const offenders = sourceFiles(sourceRoot).filter((path) => {
      const contents = readFileSync(path, "utf8");

      return queryReaders.some((pattern) => pattern.test(contents));
    });

    expect(offenders).toEqual([]);
  });
});
