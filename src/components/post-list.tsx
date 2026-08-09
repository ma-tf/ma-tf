import type { CollectionEntry } from "astro:content";

interface Props {
  posts: CollectionEntry<"blog">[];
}

export function PostList({ posts }: Props) {
  return (
    <ul className="flex flex-col gap-4">
      {posts.map((post) => {
        const pubDate = post.data.pubDate.toISOString();
        return (
          <li key={post.data.slug}>
            <button
              className="w-full text-left text-2xl cursor-pointer flex flex-col"
              onClick={() => (window.location.href = `/posts/${post.data.slug}`)}
            >
              <div className="flex gap-2">
                <span className="font-semibold">{post.data.title}</span>
                <time dateTime={pubDate}>{pubDate.split("T")[0]}</time>
              </div>
              <p className="text-sm">{post.data.description}</p>
            </button>
          </li>
        );
      })}
    </ul>
  );
}
