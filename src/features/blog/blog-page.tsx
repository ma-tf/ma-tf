import type { PlainPost } from "@features/blog/post-data";

import { NavButton } from "@components/nav-button";
import { Blog, BlogContent, BlogDescription, BlogHeader, BlogTitle } from "@features/blog/blog";
import { useParallax } from "@hooks/use-parallax";
import { previews } from "@lib/feature-flags";
import { CaretRightIcon } from "@phosphor-icons/react";

const PARALLAX = { bg: 0.15, bg2: 0.3, title: 0.3, description: 0.6, posts: 1.0 } as const;

type Offset = { x: number; y: number };

function BlogBackgrounds({
  backgrounds,
  offset,
}: {
  backgrounds: { back: string; front: string };
  offset: Offset;
}) {
  return (
    <>
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-(image:--background-image) bg-cover bg-left opacity-80 md:-inset-2 md:bg-left md:opacity-100 dark:invert"
        style={
          {
            "--background-image": `url("${backgrounds.back}")`,
            transform: `translate(${offset.x * PARALLAX.bg}px, ${offset.y * PARALLAX.bg}px)`,
          } as React.CSSProperties
        }
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-(image:--background-image) bg-bottom-left opacity-0 md:-inset-4 md:bg-cover md:bg-left md:opacity-100 dark:invert"
        style={
          {
            "--background-image": `url("${backgrounds.front}")`,
            transform: `translate(${offset.x * PARALLAX.bg2}px, ${offset.y * PARALLAX.bg2}px)`,
          } as React.CSSProperties
        }
      />
    </>
  );
}

function BlogNavigation({ offset }: { offset: Offset }) {
  const links = [
    { href: "/", label: "Home", enabled: true },
    { href: "/music", label: "Music", enabled: previews.music },
    { href: "/photos", label: "Photography", enabled: previews.photos },
    { href: "/vignettes", label: "Vignettes", enabled: previews.vignettes },
  ];

  return (
    <nav
      className="mt-4 flex flex-wrap justify-end gap-1"
      aria-label="Section navigation"
      style={{
        transform: `translate(${offset.x * PARALLAX.description}px, ${offset.y * PARALLAX.description}px)`,
      }}
    >
      {links
        .filter(({ enabled }) => enabled)
        .map(({ href, label }) => (
          <NavButton key={href} href={href}>
            {label}
          </NavButton>
        ))}
    </nav>
  );
}

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
      <BlogBackgrounds backgrounds={backgrounds} offset={offset} />
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
          <BlogNavigation offset={offset} />
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
        <li key={post.slug} className="group my-2 md:my-0 md:py-2">
          <button
            className="flex w-full cursor-pointer flex-col text-left text-2xl transition-transform duration-150 outline-none group-focus-within:md:translate-x-3 group-hover:md:translate-x-3 focus-within:md:translate-x-3"
            onClick={() => (window.location.href = `/posts/${post.slug}`)}
          >
            <div className="relative flex items-center">
              <CaretRightIcon
                size={18}
                weight="bold"
                aria-hidden="true"
                className="absolute top-1/2 -left-1 -translate-x-full -translate-y-1/2"
              />
              <span className="font-semibold">{post.title}</span>
            </div>
            <div className="flex flex-col">
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
