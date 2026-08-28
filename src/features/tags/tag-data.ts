import { getRawPosts, type PlainPost } from "@features/blog/post-data";

export type Tag = {
  tag: string;
  count: number;
};

export async function getTagIndex(): Promise<{
  tags: Tag[];
  postsByTag: Record<string, PlainPost[]>;
}> {
  const rawPosts = await getRawPosts();

  const tagCounts = new Map<string, number>();
  const postsByTag = new Map<string, PlainPost[]>();

  for (const post of rawPosts) {
    const plain = {
      slug: post.data.slug,
      title: post.data.title,
      description: post.data.description,
      pubDate: post.data.pubDate.toISOString(),
    };
    for (const tag of post.data.tags) {
      tagCounts.set(tag, (tagCounts.get(tag) ?? 0) + 1);
      const list = postsByTag.get(tag) ?? [];
      list.push(plain);
      postsByTag.set(tag, list);
    }
  }

  for (const list of postsByTag.values()) {
    list.sort((a, b) => b.pubDate.localeCompare(a.pubDate));
  }

  const tags = [...tagCounts.entries()]
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count);

  return { tags, postsByTag: Object.fromEntries(postsByTag) };
}
