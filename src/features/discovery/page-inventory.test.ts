import {
  buildPageInventory,
  routableEntries,
  routableKinds,
  staticPages,
  type PageEntry,
} from "@features/discovery/page-inventory";
import { describe, expect, it } from "vite-plus/test";

const posts = [
  {
    slug: "newer-post",
    title: "Newer post",
    description: "A newer post.",
    publicationDate: new Date("2026-03-01"),
  },
  {
    slug: "older-post",
    title: "Older post",
    description: "An older post.",
    publicationDate: new Date("2026-01-01"),
  },
];
const tags = [{ tag: "typescript" }, { tag: "astro" }];
const vignettes = [
  { slug: "fuji-sunset", title: "Fuji Sunset", description: "Sunset over Mount Fuji" },
];

const inventory = buildPageInventory({ posts, tags, vignettes });

describe("buildPageInventory", () => {
  it("gives every entry a known kind and usable metadata", () => {
    const kinds = new Set(["page", "post", "tag", "vignette"]);

    for (const entry of inventory) {
      expect(kinds.has(entry.kind)).toBe(true);
      expect(entry.path.startsWith("/")).toBe(true);
      expect(entry.title.length).toBeGreaterThan(0);
      expect(entry.description.length).toBeGreaterThan(0);
    }
  });

  it("includes every static page exactly once", () => {
    for (const page of staticPages) {
      expect(inventory.filter((entry) => entry.path === page.path)).toEqual([page]);
    }
  });

  it("adds posts with their publication date as lastmod", () => {
    expect(inventory).toContainEqual({
      path: "/posts/newer-post",
      title: "Newer post",
      description: "A newer post.",
      kind: "post",
      lastmod: new Date("2026-03-01").toISOString(),
    });
  });

  it("adds tags", () => {
    expect(inventory).toContainEqual({
      path: "/tags/typescript",
      title: "typescript",
      description: "Posts tagged typescript.",
      kind: "tag",
    });
  });

  it("adds vignettes", () => {
    expect(inventory).toContainEqual({
      path: "/vignettes/fuji-sunset",
      title: "Fuji Sunset",
      description: "Sunset over Mount Fuji",
      kind: "vignette",
    });
  });

  it("encodes slugs and tags in paths", () => {
    const encoded = buildPageInventory({
      posts: [{ slug: "a b", title: "A b", description: "x", publicationDate: new Date(0) }],
      tags: [{ tag: "c++" }],
      vignettes: [{ slug: "d/e", title: "D", description: "y" }],
    });
    const paths = encoded.map((entry) => entry.path);

    expect(paths).toContain("/posts/a%20b");
    expect(paths).toContain("/tags/c%2B%2B");
    expect(paths).toContain("/vignettes/d%2Fe");
  });
});

describe("routableEntries", () => {
  it("excludes tag aggregations from the gate's option set", () => {
    expect([...routableKinds]).toEqual(["page", "post", "vignette"]);
    expect(routableEntries(inventory).some((entry: PageEntry) => entry.kind === "tag")).toBe(false);
  });

  it("derives the options from the inventory", () => {
    const routable = routableEntries(inventory);

    expect(routable.some((entry) => entry.kind === "page")).toBe(true);
    expect(routable.some((entry) => entry.kind === "post")).toBe(true);
    expect(routable.some((entry) => entry.kind === "vignette")).toBe(true);
  });
});
