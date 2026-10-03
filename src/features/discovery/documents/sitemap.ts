import type { PageEntry } from "@features/discovery/page-inventory";

import { escapeXml } from "@lib/xml";

function withTrailingSlash(path: string): string {
  return path.endsWith("/") ? path : `${path}/`;
}

export function buildSitemap(inventory: readonly PageEntry[], site: URL): string {
  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...inventory.map(({ path, lastmod }) => {
      const loc = escapeXml(new URL(withTrailingSlash(path), site).href);
      return `  <url><loc>${loc}</loc>${lastmod ? `<lastmod>${lastmod}</lastmod>` : ""}</url>`;
    }),
    "</urlset>",
    "",
  ].join("\n");
}
