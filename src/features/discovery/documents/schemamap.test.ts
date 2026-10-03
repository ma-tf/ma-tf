import { buildSchemaMap } from "@features/discovery/documents/schemamap";
import { describe, expect, it, vi } from "vite-plus/test";

describe("buildSchemaMap", () => {
  it("declares an XML document", () => {
    expect(buildSchemaMap()).toContain('<?xml version="1.0" encoding="UTF-8"?>');
  });

  it("declares the sitemap and schemafeed namespaces on the urlset root", () => {
    const root = buildSchemaMap().split("\n")[1];

    expect(root?.startsWith("<urlset")).toBe(true);
    expect(root).toContain('xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"');
    expect(root).toContain('xmlns:sf="http://schema.org/schemas/schemafeed/0.1"');
  });

  it("lists the RSS feed as a structured-data entry", () => {
    const xml = buildSchemaMap();

    expect(xml).toContain("<loc>https://m4t.tf/rss.xml</loc>");
    expect(xml).toContain("<sf:contentType>structuredData/rss</sf:contentType>");
    expect(xml).toContain("</urlset>");
  });

  it("escapes XML entities in the location", async () => {
    vi.resetModules();
    vi.doMock("@features/discovery/catalog", () => ({
      siteUrl: "https://m4t.tf",
      resources: [{ type: "application/rss+xml", path: "/rss&a.xml" }],
    }));

    const { buildSchemaMap: buildEscaped } =
      await import("@features/discovery/documents/schemamap");

    expect(buildEscaped()).toContain("<loc>https://m4t.tf/rss&amp;a.xml</loc>");

    vi.doUnmock("@features/discovery/catalog");
    vi.resetModules();
  });
});
