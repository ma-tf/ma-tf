import { catalogueOutputPath, corpusOutputPath } from "@features/ask/corpus/hash";
import { readFile } from "node:fs/promises";
import { describe, expect, it } from "vite-plus/test";

const artefacts = [
  ["Ask corpus", corpusOutputPath],
  ["MCP catalogue", catalogueOutputPath],
] as const;

describe("generated artefacts", () => {
  for (const [label, path] of artefacts) {
    it(`${label} has every image URL resolved`, async () => {
      const contents = await readFile(path, "utf8");

      expect(contents).not.toContain("undefined/");
    });
  }
});
