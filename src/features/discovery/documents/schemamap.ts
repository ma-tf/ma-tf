import { resources, siteUrl } from "@features/discovery/catalog";
import { escapeXml } from "@lib/xml";

export function buildSchemaMap(): string {
  const rssPath =
    resources.find((resource) => resource.type === "application/rss+xml")?.path ?? "/rss.xml";

  const loc = escapeXml(`${siteUrl}${rssPath}`);

  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:sf="http://schema.org/schemas/schemafeed/0.1">',
    `  <url><loc>${loc}</loc><sf:contentType>structuredData/rss</sf:contentType></url>`,
    "</urlset>",
    "",
  ].join("\n");
}
