import { getCollection, type CollectionEntry } from "astro:content";

export type PlainPost = {
  slug: string;
  title: string;
  description: string;
  pubDate: string;
};

export async function getRawPosts(): Promise<CollectionEntry<"blog">[]> {
  return (await getCollection("blog")).filter((p) => !p.data.draft);
}

export async function getPosts(): Promise<PlainPost[]> {
  return (await getRawPosts())
    .sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf())
    .map((post) => ({
      slug: post.data.slug,
      title: post.data.title,
      description: post.data.description,
      pubDate: post.data.pubDate.toISOString(),
    }));
}
