import { getRawPosts, type PlainPost } from "@features/blog/post-data";
import { getOrInit } from "@lib/utils";

export type Tag = {
  tag: string;
  count: number;
};

export async function getTagIndex(): Promise<{
  tags: Tag[];
  postsByTag: Record<string, PlainPost[]>;
}> {
  const rawPosts = await getRawPosts();

  const postsByTag = new Map<string, PlainPost[]>();
  for (const post of rawPosts) {
    const plain = {
      slug: post.data.slug,
      title: post.data.title,
      description: post.data.description,
      publicationDate: post.data.publicationDate.toISOString(),
    };
    for (const tag of post.data.tags) {
      getOrInit(postsByTag, tag, () => []).push(plain);
    }
  }

  const tags: Tag[] = [];
  for (const [tag, list] of postsByTag.entries()) {
    list.sort((a, b) => b.publicationDate.localeCompare(a.publicationDate));
    tags.push({ tag, count: list.length });
  }
  tags.sort((a, b) => b.count - a.count);

  return { tags, postsByTag: Object.fromEntries(postsByTag) };
}
