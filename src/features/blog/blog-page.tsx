import type { PlainPost } from "@features/blog/post-data";

import { NavButton } from "@components/nav-button";
import { Blog, BlogContent, BlogDescription, BlogHeader, BlogTitle } from "@features/blog/blog";
import { previews } from "@lib/feature-flags";
import { CaretRightIcon } from "@phosphor-icons/react";

const BLOG_NAVIGATION_LINKS = [
  { href: "/", label: "Home", enabled: true },
  { href: "/photography", label: "Photography", enabled: previews.photography },
  { href: "/vignettes", label: "Vignettes", enabled: previews.vignettes },
  { href: "/music", label: "Music", enabled: previews.music },
] as const;

function BlogBackgrounds({ backgrounds }: { backgrounds: { back: string; front: string } }) {
  return (
    <>
      <div
        aria-hidden="true"
        data-parallax={15}
        className="absolute inset-0 -z-10 bg-(image:--background-image) bg-cover bg-left opacity-80 md:-inset-2 md:bg-left md:opacity-100 dark:invert"
        style={{ "--background-image": `url("${backgrounds.back}")` } as React.CSSProperties}
      />
      <div
        aria-hidden="true"
        data-parallax={30}
        className="absolute inset-0 -z-10 bg-(image:--background-image) bg-bottom-left opacity-0 md:-inset-4 md:bg-cover md:bg-left md:opacity-100 dark:invert"
        style={{ "--background-image": `url("${backgrounds.front}")` } as React.CSSProperties}
      />
    </>
  );
}

function BlogNavigation() {
  return (
    <nav
      data-parallax={60}
      className="mt-4 flex flex-wrap justify-end gap-1"
      aria-label="Section navigation"
    >
      {BLOG_NAVIGATION_LINKS.filter(({ enabled }) => enabled).map(({ href, label }) => (
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
  return (
    <div className="relative isolate flex h-dvh px-4 md:h-dvh md:overflow-hidden">
      <BlogBackgrounds backgrounds={backgrounds} />
      <Blog>
        <BlogHeader>
          <div className="animate-fade-up">
            <BlogTitle data-parallax={30}>{title}</BlogTitle>
          </div>
          <div className="animate-fade-up animation-delay-50">
            <BlogDescription data-parallax={60}>{description}</BlogDescription>
          </div>
          <div className="animate-fade-up animation-delay-100">
            <BlogNavigation />
          </div>
        </BlogHeader>
        <BlogContent data-parallax={100}>
          <PostList posts={posts} />
        </BlogContent>
      </Blog>
    </div>
  );
}

function PostList({ posts }: { posts: PlainPost[] }) {
  return (
    <ul className="flex flex-col">
      {posts.map((post, index) => (
        <li
          key={post.slug}
          className="group my-2 animate-fade-up md:my-0 md:py-2"
          style={{ "--delay": `${150 + index * 50}ms` } as React.CSSProperties}
        >
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
              <time className="shrink-0" dateTime={post.publicationDate}>
                {post.publicationDate.split("T")[0]}
              </time>
            </div>
            <p className="text-sm">{post.description}</p>
          </button>
        </li>
      ))}
    </ul>
  );
}
