import { Blog, BlogContent, BlogDescription, BlogHeader, BlogTitle } from "@components/blog";
import { cn } from "@lib/cn";
import { useState } from "react";

import { useParallax } from "../hooks/use-parallax";

type PlainPost = { slug: string; title: string; description: string; pubDate: string };

const PARALLAX = { bg: 0.15, title: 0.3, description: 0.6, posts: 1.0 } as const;

export function BlogPage({
  title,
  description,
  posts,
}: {
  title: string;
  description: string;
  posts: PlainPost[];
}) {
  const offset = useParallax();

  return (
    <div className="flex h-dvh overflow-hidden relative">
      <Blog>
        <BlogHeader>
          <BlogTitle
            style={{
              transform: `translate(${offset.x * PARALLAX.title}px, ${offset.y * PARALLAX.title}px)`,
            }}
          >
            {title}
          </BlogTitle>
          <BlogDescription
            style={{
              transform: `translate(${offset.x * PARALLAX.description}px, ${offset.y * PARALLAX.description}px)`,
            }}
          >
            {description}
          </BlogDescription>
        </BlogHeader>
        <BlogContent
          style={{
            transform: `translate(${offset.x * PARALLAX.posts}px, ${offset.y * PARALLAX.posts}px)`,
          }}
        >
          <PostList posts={posts} />
        </BlogContent>
      </Blog>
    </div>
  );
}

function PostList({ posts }: { posts: PlainPost[] }) {
  const [hovered, setHovered] = useState<number | null>(null);

  return (
    <ul className="flex flex-col">
      {posts.map((post, i) => (
        <li
          key={post.slug}
          onMouseEnter={() => setHovered(i)}
          onMouseLeave={() => setHovered(null)}
          className={cn("py-2 transition-all duration-150", hovered === i && "translate-x-2")}
        >
          <button
            className="w-full text-left text-2xl cursor-pointer flex flex-col"
            onClick={() => (window.location.href = `/posts/${post.slug}`)}
          >
            <div className="flex flex-col md:flex-row md:gap-2">
              <span className="font-semibold truncate">{post.title}</span>
              <time className="shrink-0" dateTime={post.pubDate}>
                {post.pubDate.split("T")[0]}
              </time>
            </div>
            <p className="text-sm truncate">{post.description}</p>
          </button>
        </li>
      ))}
    </ul>
  );
}
