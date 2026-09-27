import { buildSitemap } from "@features/discovery/documents/sitemap";
import { staticPages, type PageEntry } from "@features/discovery/page-inventory";
import { describe, expect, it } from "vite-plus/test";

const site = new URL("https://m4t.tf");

const inventory: readonly PageEntry[] = [
  ...staticPages,
  {
    path: "/posts/newer-post",
    title: "Newer post",
    description: "A newer post.",
    kind: "post",
    lastmod: "2026-03-01T00:00:00.000Z",
  },
  {
    path: "/tags/typescript",
    title: "typescript",
    description: "Posts tagged typescript.",
    kind: "tag",
  },
  {
    path: "/vignettes/fuji-sunset",
    title: "Fuji Sunset",
    description: "Sunset over Mount Fuji",
    kind: "vignette",
  },
];

describe("buildSitemap", () => {
  it("lists every inventory path with a trailing slash", () => {
    const xml = buildSitemap(inventory, site);

    for (const entry of inventory) {
      const expected = entry.path === "/" ? "https://m4t.tf/" : `https://m4t.tf${entry.path}/`;
      expect(xml).toContain(`<loc>${expected}</loc>`);
    }
  });

  it("carries the lastmod of dated content", () => {
    const xml = buildSitemap(inventory, site);

    expect(xml).toContain("<lastmod>2026-03-01T00:00:00.000Z</lastmod>");
  });

  it("does not double the root slash", () => {
    const xml = buildSitemap(inventory, site);

    expect(xml).toContain("<loc>https://m4t.tf/</loc>");
    expect(xml).not.toContain("https://m4t.tf//");
  });

  it("escapes XML entities in locations", () => {
    const xml = buildSitemap(
      [{ path: "/tags/a&b", title: "a&b", description: "x", kind: "tag" }],
      site,
    );

    expect(xml).toContain("<loc>https://m4t.tf/tags/a&amp;b/</loc>");
  });
});
