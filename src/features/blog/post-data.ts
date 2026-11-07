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
