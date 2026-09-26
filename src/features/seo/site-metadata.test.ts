import { siteUrl } from "@features/discovery/catalog";
import { faqs, pageNameFor, service, siteIdentity, siteJsonLd } from "@features/seo/site-metadata";
import { describe, expect, it } from "vite-plus/test";

type Node = Record<string, unknown>;

function graphFor(pathname = "/"): Node[] {
  return siteJsonLd(`${siteUrl}/graphics/old house.png`, pathname)["@graph"] as unknown as Node[];
}

function nodeOfType(nodes: Node[], type: string): Node {
  const node = nodes.find((candidate) => candidate["@type"] === type);

  if (!node) throw new Error(`No node of type "${type}"`);

  return node;
}

describe("siteJsonLd", () => {
  const imageUrl = `${siteUrl}/graphics/old house.png`;

  it("declares website and person nodes with stable ids", () => {
    const [website, person] = graphFor();
    expect(website?.["@type"]).toBe("WebSite");
    expect(person?.["@type"]).toBe("Person");
    expect(website?.["@id"]).toBe(`${siteUrl}/#website`);
    expect(person?.["@id"]).toBe(`${siteUrl}/#person`);
  });

  it("uses the absolute site url for the identity nodes", () => {
    const [website, person] = graphFor();
    expect(website?.["url"]).toBe(siteUrl);
    expect(person?.["url"]).toBe(siteUrl);
  });

  it("describes the person with the image, authority profiles, and a country-only address", () => {
    const person = nodeOfType(graphFor(), "Person");
    expect(person["image"]).toBe(imageUrl);
    expect(person["sameAs"]).toEqual([
      siteIdentity.github,
      siteIdentity.linkedin,
      siteIdentity.bandcamp,
    ]);
    expect(person["address"]).toEqual({
      "@type": "PostalAddress",
      addressCountry: siteIdentity.addressCountry,
    });
  });

  it("links the website to the person", () => {
    const website = nodeOfType(graphFor(), "WebSite");
    expect(website["publisher"]).toEqual({ "@id": `${siteUrl}/#person` });
  });

  it("adds FAQ, service, and breadcrumb nodes to the homepage", () => {
    expect(graphFor().map((node) => node["@type"])).toEqual([
      "WebSite",
      "Person",
      "FAQPage",
      "Service",
      "BreadcrumbList",
    ]);
  });

  it("omits FAQ and service nodes away from the homepage", () => {
    expect(graphFor("/about").map((node) => node["@type"])).toEqual([
      "WebSite",
      "Person",
      "BreadcrumbList",
    ]);
  });

  it("mirrors the published FAQ content", () => {
    const mainEntity = nodeOfType(graphFor(), "FAQPage")["mainEntity"] as Node[];
    expect(mainEntity.map((entry) => entry["name"])).toEqual(faqs.map((faq) => faq.question));
    expect(mainEntity[0]?.["acceptedAnswer"]).toEqual({
      "@type": "Answer",
      text: faqs[0]?.answer,
    });
  });

  it("describes the service with the person as provider", () => {
    const serviceNode = nodeOfType(graphFor(), "Service");
    expect(serviceNode["serviceType"]).toBe(service.name);
    expect(serviceNode["provider"]).toEqual({ "@id": `${siteUrl}/#person` });
    expect(serviceNode["url"]).toBe(`${siteUrl}${service.contactPath}`);
  });

  it("builds breadcrumbs from parent sections and skips dynamic slugs", () => {
    expect(nodeOfType(graphFor(), "BreadcrumbList")["itemListElement"]).toEqual([
      { "@type": "ListItem", position: 1, name: "Home", item: `${siteUrl}/` },
    ]);

    expect(nodeOfType(graphFor("/about"), "BreadcrumbList")["itemListElement"]).toEqual([
      { "@type": "ListItem", position: 1, name: "Home", item: `${siteUrl}/` },
      { "@type": "ListItem", position: 2, name: "About", item: `${siteUrl}/about` },
    ]);

    expect(
      nodeOfType(graphFor("/posts/20260908-1-llms-are-tactical-programmers"), "BreadcrumbList")[
        "itemListElement"
      ],
    ).toEqual([
      { "@type": "ListItem", position: 1, name: "Home", item: `${siteUrl}/` },
      { "@type": "ListItem", position: 2, name: "Blog", item: `${siteUrl}/blog` },
    ]);
  });
});

describe("pageNameFor", () => {
  it("names the mapped sections, including dynamic children", () => {
    expect(pageNameFor("/about")).toBe("About");
    expect(pageNameFor("/developers")).toBe("Developers");
    expect(pageNameFor("/vignettes/bolex")).toBe("Vignettes");
    expect(pageNameFor("/posts/20260908-1-llms-are-tactical-programmers")).toBe("Blog");
  });

  it("names the homepage and returns undefined for unknown paths", () => {
    expect(pageNameFor("/")).toBe("Home");
    expect(pageNameFor("/nothing-here")).toBeUndefined();
  });
});
