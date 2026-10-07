import type { AskTagFile } from "@features/ask/corpus/types";

import { applyAskTags } from "@features/ask/corpus/tags";
import { describe, expect, it } from "vite-plus/test";

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
