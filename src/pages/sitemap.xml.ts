import type { APIContext, APIRoute } from "astro";

import { getRawPosts } from "@features/blog/post-data";
import { siteUrl } from "@features/discovery/catalog";
import { buildSitemap } from "@features/discovery/documents/sitemap";
import { buildPageInventory } from "@features/discovery/page-inventory";
import { getTagIndex } from "@features/tags/tag-data";
import { getCollection, type CollectionEntry } from "astro:content";

async function getPageInventory() {
  const [posts, tagIndex, vignettes] = await Promise.all([
    getRawPosts(),
    getTagIndex(),
    getCollection("vignettes"),
  ]);

  return buildPageInventory({
    posts: posts.map((post) => ({
      slug: post.data.slug,
      title: post.data.title,
      description: post.data.description,
      publicationDate: post.data.publicationDate,
    })),
    tags: tagIndex.tags,
    vignettes: vignettes
      .filter((entry: CollectionEntry<"vignettes">) => entry.data.enabled)
      .map((entry) => ({
        slug: entry.data.slug,
        title: entry.data.id,
        description: entry.data.summary,
      })),
  });
}

export const GET = (async (context: APIContext) => {
  const site = context.site ?? new URL(siteUrl);

  const inventory = await getPageInventory();

  const body = buildSitemap(inventory, site);

  return new Response(body, {
    headers: { "Content-Type": "application/xml; charset=utf-8" },
  });
}) satisfies APIRoute;
