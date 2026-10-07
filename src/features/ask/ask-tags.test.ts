import type { AskTagFile, CorpusArtefact } from "@features/ask/corpus/types";

import { applyAskTags } from "@features/ask/corpus/tags";
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vite-plus/test";

const tags = JSON.parse(readFileSync("src/features/ask/ask-tags.json", "utf8")) as AskTagFile;
const corpus = JSON.parse(
  readFileSync("src/features/ask/published-pages.generated.json", "utf8"),
) as CorpusArtefact;

describe("ask tags", () => {
  it("targets a corpus page for every tag group", () => {
    for (const target of Object.keys(tags)) {
      const single: AskTagFile = { [target]: tags[target]! };
      const merged = applyAskTags(corpus.pages, single);
      const reached = merged.some((page, index) => page.content !== corpus.pages[index]?.content);

      expect(reached, `no corpus page matches ${target}`).toBe(true);
    }
  });

  it("is the tag file applied to the untagged pages", () => {
    const base = corpus.pages.map((page) => ({
      ...page,
      content: page.content.replace(/\n\n## Invisible tags\n\n[\s\S]*$/, ""),
    }));

    expect(applyAskTags(base, tags)).toEqual(corpus.pages);
  });
});
