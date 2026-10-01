import { readFileSync } from "node:fs";
import { describe, expect, it } from "vite-plus/test";

import { applyAskTags, type AskTagFile } from "@/scripts/generate-ask-corpus.mts";

type Corpus = { pages: { url: string; title: string; content: string }[] };

const tags = JSON.parse(readFileSync("src/features/ask/ask-tags.json", "utf8")) as AskTagFile;
const corpus = JSON.parse(
  readFileSync("src/features/ask/published-pages.generated.json", "utf8"),
) as Corpus;

describe("ask tags", () => {
  it("targets a corpus page for every tag group", () => {
    for (const target of Object.keys(tags)) {
      const single: AskTagFile = { [target]: tags[target]! };
      const merged = applyAskTags(corpus.pages, single);
      const reached = merged.some((page, index) => page.content !== corpus.pages[index]?.content);

      expect(reached, `no corpus page matches ${target}`).toBe(true);
    }
  });
});
