import { siteUrl } from "@features/discovery/catalog";
import { siteIdentity, siteJsonLd } from "@features/seo/site-metadata";
import { describe, expect, it } from "vite-plus/test";

describe("siteJsonLd", () => {
  const logoUrl = `${siteUrl}/graphics/old house.png`;
  const graph = siteJsonLd(logoUrl)["@graph"] as unknown as Array<Record<string, unknown>>;
  const [website, organization, person] = graph;

  it("declares website, organization, and person nodes with stable ids", () => {
    expect(graph.map((node) => node["@type"])).toEqual(["WebSite", "Organization", "Person"]);
    expect(graph.map((node) => node["@id"])).toEqual([
      `${siteUrl}/#website`,
      `${siteUrl}/#organization`,
      `${siteUrl}/#person`,
    ]);
  });

  it("uses absolute site urls", () => {
    for (const node of graph) {
      expect(node["url"]).toBe(siteUrl);
    }
  });

  it("describes the organization with the logo, GitHub, and a contact point", () => {
    expect(organization?.["logo"]).toBe(logoUrl);
    expect(organization?.["sameAs"]).toEqual([siteIdentity.github]);
    expect(organization?.["contactPoint"]).toEqual({
      "@type": "ContactPoint",
      email: siteIdentity.email,
      contactType: "customer support",
    });
  });

  it("links the person to the same profile and the website to the person", () => {
    expect(website?.["publisher"]).toEqual({ "@id": `${siteUrl}/#person` });
    expect(person?.["sameAs"]).toEqual([siteIdentity.github]);
  });
});
