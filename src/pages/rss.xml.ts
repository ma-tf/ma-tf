import type { APIContext } from "astro";

import rss from "@astrojs/rss";
import { getRawPosts } from "@features/blog/post-data";
import { siteIdentity } from "@features/seo/site-metadata";

export async function GET(context: APIContext) {
  const posts = await getRawPosts();
  const site = context.site!;
  return rss({
    title: "Matt Fehrenbach | Blog",
    description: `Blog posts by ${siteIdentity.name}`,
    site,
    items: posts.map((post) => ({
      title: post.data.title,
      pubDate: post.data.publicationDate,
      description: post.data.description,
      link: new URL(`/posts/${post.data.slug}`, site).href,
    })),
    customData: `<language>en-gb</language>`,
  });
}
