import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vite-plus/test";

import { hasResourceCatalogue } from "@/scripts/generate-ask-corpus.mts";

const directories: string[] = [];

function temporaryCatalogue(contents: string): string {
  const directory = mkdtempSync(join(tmpdir(), "ask-corpus-"));
  directories.push(directory);

  const path = join(directory, "catalogue.json");
  writeFileSync(path, contents);

  return path;
}

afterEach(() => {
  for (const directory of directories.splice(0)) {
    rmSync(directory, { recursive: true, force: true });
  }
});

describe("hasResourceCatalogue", () => {
  it("treats an empty resources array as having no catalogue", async () => {
    const path = temporaryCatalogue(JSON.stringify({ resources: [] }));

    await expect(hasResourceCatalogue(path)).resolves.toBe(false);
  });

  it("treats a populated resources array as having a catalogue", async () => {
    const resources = [{ uri: "https://m4t.tf/about" }];
    const path = temporaryCatalogue(JSON.stringify({ resources }));

    await expect(hasResourceCatalogue(path)).resolves.toBe(true);
  });

  it("treats a missing file as having no catalogue", async () => {
    const path = join(tmpdir(), "ask-corpus-missing", "catalogue.json");

    await expect(hasResourceCatalogue(path)).resolves.toBe(false);
  });
});
