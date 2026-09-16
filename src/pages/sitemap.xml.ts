import type { APIContext, APIRoute } from "astro";

import { getRawPosts } from "@features/blog/post-data";
import { getTagIndex } from "@features/tags/tag-data";
import { getCollection } from "astro:content";

export const prerender = true;

const staticPaths = [
  "/",
  "/about/",
  "/blog/",
  "/contact/",
  "/cv/",
  "/developers/",
  "/graphics/",
  "/music/",
  "/photography/",
  "/privacy/",
  "/vignettes/",
];

function escapeXml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

export const GET = (async (context: APIContext) => {
  const site = context.site ?? new URL("https://m4t.tf");

  const [posts, tagIndex, vignettes] = await Promise.all([
    getRawPosts(),
    getTagIndex(),
    getCollection("vignettes"),
  ]);

  const entries = [
    ...staticPaths.map((path) => ({ path, lastmod: undefined })),
    ...posts.map((post) => ({
      path: `/posts/${encodeURIComponent(post.data.slug)}/`,
      lastmod: post.data.publicationDate.toISOString(),
    })),
    ...tagIndex.tags.map(({ tag }) => ({
      path: `/tags/${encodeURIComponent(tag)}/`,
      lastmod: undefined,
    })),
    ...vignettes
      .filter(({ data }) => data.enabled)
      .map(({ data }) => ({
        path: `/vignettes/${encodeURIComponent(data.slug)}/`,
        lastmod: undefined,
      })),
  ];

  const body = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...entries.map(({ path, lastmod }) => {
      const loc = escapeXml(new URL(path, site).href);
      return `  <url><loc>${loc}</loc>${lastmod ? `<lastmod>${lastmod}</lastmod>` : ""}</url>`;
    }),
    "</urlset>",
    "",
  ].join("\n");

  return new Response(body, {
    headers: { "Content-Type": "application/xml; charset=utf-8" },
  });
}) satisfies APIRoute;
