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
] as const;

export type SitemapInput = {
  posts: { slug: string; publicationDate: Date }[];
  tags: { tag: string }[];
  vignettes: { slug: string }[];
};

type SitemapEntry = {
  path: string;
  lastmod?: string;
};

function escapeXml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

export function buildSitemap(input: SitemapInput, site: URL): string {
  const entries: SitemapEntry[] = [
    ...staticPaths.map((path): SitemapEntry => ({ path })),
    ...input.posts.map((post): SitemapEntry => ({
      path: `/posts/${encodeURIComponent(post.slug)}/`,
      lastmod: post.publicationDate.toISOString(),
    })),
    ...input.tags.map(({ tag }): SitemapEntry => ({
      path: `/tags/${encodeURIComponent(tag)}/`,
    })),
    ...input.vignettes.map(({ slug }): SitemapEntry => ({
      path: `/vignettes/${encodeURIComponent(slug)}/`,
    })),
  ];

  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...entries.map(({ path, lastmod }) => {
      const loc = escapeXml(new URL(path, site).href);
      return `  <url><loc>${loc}</loc>${lastmod ? `<lastmod>${lastmod}</lastmod>` : ""}</url>`;
    }),
    "</urlset>",
    "",
  ].join("\n");
}
