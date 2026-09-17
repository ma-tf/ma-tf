import type { APIContext, APIRoute } from "astro";

import { getRawPosts } from "@features/blog/post-data";
import { siteUrl } from "@features/discovery/catalog";
import { buildSitemap } from "@features/discovery/documents/sitemap";
import { getTagIndex } from "@features/tags/tag-data";
import { getCollection, type CollectionEntry } from "astro:content";

export const GET = (async (context: APIContext) => {
  const site = context.site ?? new URL(siteUrl);

  const [posts, tagIndex, vignettes] = await Promise.all([
    getRawPosts(),
    getTagIndex(),
    getCollection("vignettes"),
  ]);

  const body = buildSitemap(
    {
      posts: posts.map((post) => ({
        slug: post.data.slug,
        publicationDate: post.data.publicationDate,
      })),
      tags: tagIndex.tags,
      vignettes: vignettes
        .filter((entry: CollectionEntry<"vignettes">) => entry.data.enabled)
        .map((entry: CollectionEntry<"vignettes">) => ({ slug: entry.data.slug })),
    },
    site,
  );

  return new Response(body, {
    headers: { "Content-Type": "application/xml; charset=utf-8" },
  });
}) satisfies APIRoute;
