import type { CollectionEntry } from "astro:content";

interface Props {
  posts: CollectionEntry<"blog">[];
}

export function PostList({ posts }: Props) {
  return (
    <ul>
      {posts.map((post) => (
        <li key={post.data.slug}>
          <a href={`/posts/${post.data.slug}`}>
            <h2>{post.data.title}</h2>
          </a>
          <time dateTime={post.data.pubDate.toISOString()}>
            {post.data.pubDate.toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </time>
          <p>{post.data.description}</p>
        </li>
      ))}
    </ul>
  );
}
