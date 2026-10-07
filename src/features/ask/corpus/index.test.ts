import type { CorpusArtefact, CorpusPage, ResourceArtefact } from "@features/ask/corpus";

import { buildCorpus, corpusStatus } from "@features/ask/corpus";
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vite-plus/test";

const corpus = JSON.parse(
  readFileSync("src/features/ask/published-pages.generated.json", "utf8"),
) as CorpusArtefact;
const catalogue = JSON.parse(
  readFileSync("src/features/mcp/resources.generated.json", "utf8"),
) as ResourceArtefact;

const bodies = new Map(catalogue.resources.map((resource) => [resource.uri, resource.text]));

describe("buildCorpus", () => {
  it("reproduces the committed corpus and catalogue exactly", async () => {
    const result = await buildCorpus({
      pages: corpus.pages,
      resources: catalogue.resources,
      tags: undefined,
      sourceHash: corpus.sourceHash,
      fetchBody: async (uri) => {
        const text = bodies.get(uri);
        if (text === undefined) throw new Error(`No body for ${uri}`);

        return text;
      },
    });

    expect(result.corpus).toEqual(corpus);
    expect(result.catalogue).toEqual(catalogue);
  });

  it("reuses page bodies without calling fetchBody", async () => {
    const page: CorpusPage = {
      url: "https://m4t.tf/about",
      title: "About",
      content: "about body",
    };
    const resource = {
      uri: "https://m4t.tf/about",
      name: "about",
      title: "About",
      description: "background and purpose of the site",
      mimeType: "text/markdown" as const,
    };

    const result = await buildCorpus({
      pages: [page],
      resources: [resource],
      tags: undefined,
      sourceHash: "hash",
      fetchBody: async () => {
        throw new Error("fetchBody should not be called for a page-backed resource");
      },
    });

    expect(result).toEqual({
      corpus: { sourceHash: "hash", pages: [page] },
      catalogue: { sourceHash: "hash", resources: [{ ...resource, text: "about body" }] },
    });
  });
});

describe("corpusStatus", () => {
  it("is current when both hashes match and the catalogue is present", () => {
    expect(
      corpusStatus("hash", { corpusHash: "hash", resourcesHash: "hash", hasResources: true }),
    ).toEqual({ state: "current" });
  });

  it("reports the stale reason in order of detection", () => {
    expect(
      corpusStatus("hash", { corpusHash: undefined, resourcesHash: "hash", hasResources: true }),
    ).toEqual({ state: "stale", reason: "corpus-missing" });
    expect(
      corpusStatus("hash", { corpusHash: "old", resourcesHash: "hash", hasResources: true }),
    ).toEqual({ state: "stale", reason: "corpus-hash" });
    expect(
      corpusStatus("hash", { corpusHash: "hash", resourcesHash: undefined, hasResources: true }),
    ).toEqual({ state: "stale", reason: "resources-missing" });
    expect(
      corpusStatus("hash", { corpusHash: "hash", resourcesHash: "old", hasResources: true }),
    ).toEqual({ state: "stale", reason: "resources-hash" });
    expect(
      corpusStatus("hash", { corpusHash: "hash", resourcesHash: "hash", hasResources: false }),
    ).toEqual({ state: "stale", reason: "empty-catalogue" });
  });
});
