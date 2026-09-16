import { getCollection, type CollectionEntry } from "astro:content";

export type PlainPost = {
  slug: string;
  title: string;
  description: string;
  publicationDate: string;
};

export async function getRawPosts(): Promise<CollectionEntry<"blog">[]> {
  return (await getCollection("blog")).filter((p: CollectionEntry<"blog">) => !p.data.draft);
}

export async function getPosts(): Promise<PlainPost[]> {
  return (await getRawPosts())
    .sort((a, b) => b.data.publicationDate.valueOf() - a.data.publicationDate.valueOf())
    .map((post) => ({
      slug: post.data.slug,
      title: post.data.title,
      description: post.data.description,
      publicationDate: post.data.publicationDate.toISOString(),
    }));
}
