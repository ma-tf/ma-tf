import type { APIContext } from "astro";

import rss from "@astrojs/rss";
import { getCollection, type CollectionEntry } from "astro:content";

export async function GET(context: APIContext) {
  const posts = (await getCollection("blog")).filter(
    (post: CollectionEntry<"blog">) => !post.data.draft,
  );
  return rss({
    title: "Matt F | Blog",
    description: "Blog posts by Matt F",
    site: context.site!,
    items: posts.map((post: CollectionEntry<"blog">) => ({
      title: post.data.title,
      pubDate: post.data.pubDate,
      description: post.data.description,
      link: `/posts/${post.data.slug}`,
    })),
    customData: `<language>en-gb</language>`,
  });
}
