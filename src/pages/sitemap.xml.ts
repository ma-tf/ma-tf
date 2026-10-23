import type { APIContext, APIRoute } from "astro";

import { siteUrl } from "@features/discovery/catalog";
import { buildSitemap } from "@features/discovery/documents/sitemap";
import { getPageInventory } from "@features/discovery/page-inventory-source";

export const GET = (async (context: APIContext) => {
  const site = context.site ?? new URL(siteUrl);

  const inventory = await getPageInventory();

  const body = buildSitemap(inventory, site);

  return new Response(body, {
    headers: { "Content-Type": "application/xml; charset=utf-8" },
  });
}) satisfies APIRoute;
