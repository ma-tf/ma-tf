import { Blog, BlogContent, BlogDescription, BlogHeader, BlogTitle } from "@components/blog";
import { useParallax } from "@hooks/use-parallax";

type PlainPost = { slug: string; title: string; description: string; pubDate: string };

const PARALLAX = { bg: 0.15, bg2: 0.3, title: 0.3, description: 0.6, posts: 1.0 } as const;

export function BlogPage({
  title,
  description,
  posts,
  backgrounds,
}: {
  title: string;
  description: string;
  posts: PlainPost[];
  backgrounds: { back: string; front: string };
}) {
  const offset = useParallax();

  return (
    <div className="h-vh relative isolate flex px-4 md:h-dvh md:overflow-hidden">
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-cover bg-left opacity-80 md:-inset-2 md:bg-left md:opacity-100 dark:invert"
        style={{
          backgroundImage: `url("${backgrounds.back}")`,
          transform: `translate(${offset.x * PARALLAX.bg}px, ${offset.y * PARALLAX.bg}px)`,
        }}
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-bottom-left opacity-0 md:-inset-4 md:bg-cover md:bg-left md:opacity-100 dark:invert"
        style={{
          backgroundImage: `url("${backgrounds.front}")`,
          transform: `translate(${offset.x * PARALLAX.bg2}px, ${offset.y * PARALLAX.bg2}px)`,
        }}
      />
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
  return (
    <ul className="flex flex-col">
      {posts.map((post) => (
        <li
          key={post.slug}
          className="my-2 transition-transform duration-150 md:my-0 md:py-2 focus-within:md:translate-x-2 hover:md:translate-x-2"
        >
          <button
            className="flex w-full cursor-pointer flex-col text-left text-2xl outline-none"
            onClick={() => (window.location.href = `/posts/${post.slug}`)}
          >
            <div className="flex flex-col">
              <span className="font-semibold">{post.title}</span>
              <time className="shrink-0" dateTime={post.pubDate}>
                {post.pubDate.split("T")[0]}
              </time>
            </div>
            <p className="text-sm">{post.description}</p>
          </button>
        </li>
      ))}
    </ul>
  );
}
