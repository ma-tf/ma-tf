import { describe, expect, it } from "vite-plus/test";

import {
  applyAskTags,
  assembleResourceCatalogue,
  type AskTagFile,
  hashInputPaths,
  hashInputs,
  isCatalogueCurrent,
  shouldRegenerate,
} from "@/scripts/generate-ask-corpus.mts";

const pages = [
  { url: "https://m4t.tf/photography", title: "Photography", content: "photo body" },
  { url: "https://m4t.tf/about", title: "About", content: "about body" },
];

const tags: AskTagFile = {
  "/photography/": {
    "photography/20241130_Luxembourg_1_0": {
      short: "Underground car park",
      keywords: ["underground", "Luxembourg"],
    },
    "Canon EOS-1V": { short: "Primary film SLR", keywords: ["35mm", "film"] },
  },
};

describe("applyAskTags", () => {
  it("appends a labelled, key-sorted block to the matching page", () => {
    const [photography] = applyAskTags(pages, tags);

    expect(photography?.content).toBe(
      "photo body\n\n## Invisible tags\n\n" +
        "- Canon EOS-1V — Primary film SLR — Keywords: 35mm, film\n" +
        "- photography/20241130_Luxembourg_1_0 — Underground car park — Keywords: underground, Luxembourg\n",
    );
  });

  it("leaves a page without tags untouched", () => {
    const [, about] = applyAskTags(pages, tags);

    expect(about).toBe(pages[1]);
  });

  it("orders items by key regardless of the tag file's own order", () => {
    const insertionOrders: AskTagFile[] = [
      {
        "/photography": {
          "Canon EOS-1V": { short: "Primary film SLR", keywords: ["35mm", "film"] },
          "photography/20241130_Luxembourg_1_0": {
            short: "Underground car park",
            keywords: ["underground"],
          },
        },
      },
      {
        "/photography": {
          "photography/20241130_Luxembourg_1_0": {
            short: "Underground car park",
            keywords: ["underground"],
          },
          "Canon EOS-1V": { short: "Primary film SLR", keywords: ["35mm", "film"] },
        },
      },
    ];

    const [first] = applyAskTags(pages, insertionOrders[0]);
    const [second] = applyAskTags(pages, insertionOrders[1]);

    expect(first?.content).toBe(second?.content);
  });

  it("matches targets ignoring origin, trailing slash and query", () => {
    const [photography] = applyAskTags(pages, {
      "https://m4t.tf/photography/?utm=1": { gear: { short: "A camera", keywords: [] } },
    });

    expect(photography?.content).toContain("- gear — A camera\n");
  });

  it("returns the pages unchanged when the tag file is absent", () => {
    expect(applyAskTags(pages, undefined)).toBe(pages);
  });
});

const metadata = [
  {
    uri: "https://m4t.tf/about",
    name: "about",
    title: "About",
    description: "background and purpose of the site",
    mimeType: "text/markdown" as const,
  },
  {
    uri: "https://m4t.tf/posts/post-1",
    name: "posts/post-1",
    title: "Post 1",
    description: "Description 1",
    mimeType: "text/markdown" as const,
    annotations: { lastModified: "2026-09-01T00:00:00.000Z" },
  },
];

describe("assembleResourceCatalogue", () => {
  it("pairs each resource with its fetched body", () => {
    const catalogue = assembleResourceCatalogue(
      "hash",
      metadata,
      new Map([
        ["https://m4t.tf/about", "about body"],
        ["https://m4t.tf/posts/post-1", "post body"],
      ]),
    );

    expect(catalogue.sourceHash).toBe("hash");
    expect(catalogue.resources).toEqual([
      { ...metadata[0], text: "about body" },
      { ...metadata[1], text: "post body" },
    ]);
  });

  it("throws when a resource has no fetched body", () => {
    expect(() =>
      assembleResourceCatalogue(
        "hash",
        metadata,
        new Map([["https://m4t.tf/about", "about body"]]),
      ),
    ).toThrow("No body fetched for https://m4t.tf/posts/post-1");
  });
});

describe("shouldRegenerate", () => {
  it("regenerates when forced", () => {
    expect(shouldRegenerate(true, "hash", "hash", "hash", true)).toBe(true);
  });

  it("regenerates when the corpus hash is missing or stale", () => {
    expect(shouldRegenerate(false, "hash", undefined, "hash", true)).toBe(true);
    expect(shouldRegenerate(false, "hash", "old", "hash", true)).toBe(true);
  });

  it("regenerates when the MCP catalogue is missing, invalid or stale", () => {
    expect(shouldRegenerate(false, "hash", "hash", undefined, true)).toBe(true);
    expect(shouldRegenerate(false, "hash", "hash", "old", true)).toBe(true);
    expect(shouldRegenerate(false, "hash", "hash", "hash", false)).toBe(true);
  });

  it("skips only when both hashes match and the catalogue is present", () => {
    expect(shouldRegenerate(false, "hash", "hash", "hash", true)).toBe(false);
  });
});

describe("hashInputPaths", () => {
  it("includes the modules that build the generated content", async () => {
    const paths = await hashInputPaths();

    expect(paths).toContain("src/features/mcp/catalogue.ts");
    expect(paths).toContain("src/features/discovery/documents/llms.ts");
    expect(paths).toContain("src/lib/rate-limits.ts");
    expect(paths).toContain("src/lib/feature-flags.ts");
    expect(paths).toContain("src/content/profile.json");
  });

  it("includes content sources and the content configuration", async () => {
    const paths = await hashInputPaths();

    expect(paths).toContain("src/content.config.ts");
    expect(paths).toContain("src/content/vignettes.json");
    expect(paths.some((path) => path.startsWith("src/content/blog/"))).toBe(true);
  });

  it("includes the Ask tag overrides", async () => {
    expect(await hashInputPaths()).toContain("src/features/ask/ask-tags.json");
  });

  it("excludes test files so editing one cannot move the hash", async () => {
    expect((await hashInputPaths()).filter((path) => path.endsWith(".test.ts"))).toEqual([]);
  });

  it("excludes modules the generated content does not import", async () => {
    expect(await hashInputPaths()).not.toContain("src/lib/accept.ts");
  });

  it("returns a sorted, de-duplicated path set", async () => {
    const paths = await hashInputPaths();

    expect(paths).toEqual([...new Set(paths)].sort());
  });
});

describe("hashInputs", () => {
  it("is deterministic", async () => {
    expect(await hashInputs()).toBe(await hashInputs());
  });

  it("covers guide prose, so changing a guide source moves the hash", async () => {
    expect(await hashInputPaths()).toContain("src/lib/rate-limits.ts");
  });
});

describe("isCatalogueCurrent", () => {
  it("is current when both hashes match and the catalogue is present", () => {
    expect(isCatalogueCurrent("hash", "hash", "hash", true)).toBe(true);
  });

  it("is stale when either hash is missing or different", () => {
    expect(isCatalogueCurrent("hash", undefined, "hash", true)).toBe(false);
    expect(isCatalogueCurrent("hash", "old", "hash", true)).toBe(false);
    expect(isCatalogueCurrent("hash", "hash", undefined, true)).toBe(false);
    expect(isCatalogueCurrent("hash", "hash", "old", true)).toBe(false);
  });

  it("is stale when the catalogue has no resources", () => {
    expect(isCatalogueCurrent("hash", "hash", "hash", false)).toBe(false);
  });
});
