import { siteUrl } from "@features/discovery/catalog";
import { siteIdentity, siteJsonLd } from "@features/seo/site-metadata";
import { describe, expect, it } from "vite-plus/test";

describe("siteJsonLd", () => {
  const imageUrl = `${siteUrl}/graphics/old house.png`;
  const graph = siteJsonLd(imageUrl)["@graph"] as unknown as Array<Record<string, unknown>>;
  const [website, person] = graph;

  it("declares website and person nodes with stable ids", () => {
    expect(graph.map((node) => node["@type"])).toEqual(["WebSite", "Person"]);
    expect(graph.map((node) => node["@id"])).toEqual([`${siteUrl}/#website`, `${siteUrl}/#person`]);
  });

  it("uses absolute site urls", () => {
    for (const node of graph) {
      expect(node["url"]).toBe(siteUrl);
    }
  });

  it("describes the person with the image, authority profiles, and a country-only address", () => {
    expect(person?.["image"]).toBe(imageUrl);
    expect(person?.["sameAs"]).toEqual([
      siteIdentity.github,
      siteIdentity.linkedin,
      siteIdentity.bandcamp,
    ]);
    expect(person?.["address"]).toEqual({
      "@type": "PostalAddress",
      addressCountry: siteIdentity.addressCountry,
    });
  });

  it("links the website to the person", () => {
    expect(website?.["publisher"]).toEqual({ "@id": `${siteUrl}/#person` });
  });
});
