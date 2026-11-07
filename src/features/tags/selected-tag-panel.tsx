import type { PlainPost } from "@features/blog/post-data";
import type { Tag } from "@features/tags/tag-data";

import { NavButton } from "@components/nav-button";
import { TagPostsProvider, useTagPosts } from "@features/tags/tag-posts-context";
import { ArrowLeftIcon, ArrowRightIcon } from "@phosphor-icons/react";
import { cn } from "cn";
import { useEffect, useRef } from "react";

function TagPostsPagination() {
  const { currentPage, totalPages, goToPage } = useTagPosts();
  return (
    <nav aria-label="Tag posts pages" className="flex w-fit items-center gap-2">
      <ArrowLeftIcon
        size={14}
        aria-label="Previous page"
        onClick={() => goToPage(currentPage - 1)}
        className={cn(
          "shrink-0",
          currentPage === 0
            ? "cursor-not-allowed opacity-40"
            : "cursor-pointer text-foreground transition-colors duration-150 hover:text-foreground/70",
        )}
      />
      <span className="text-xs text-muted-foreground">
        {currentPage + 1}/{totalPages}
      </span>
      <ArrowRightIcon
        size={14}
        aria-label="Next page"
        onClick={() => goToPage(currentPage + 1)}
        className={cn(
          "shrink-0",
          currentPage === totalPages - 1
            ? "cursor-not-allowed opacity-40"
            : "cursor-pointer text-foreground transition-colors duration-150 hover:text-foreground/70",
        )}
      />
    </nav>
  );
}

function TagPosts() {
  const { tagName, groups, currentPage, totalPages } = useTagPosts();
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    listRef.current?.scrollTo({ top: 0 });
  }, [currentPage]);

  return (
    <div className="flex min-h-0 min-w-0 flex-col gap-4">
      <span className="text-3xl font-bold">{tagName}</span>
      <div ref={listRef} className="flex min-h-0 min-w-0 flex-col gap-4 overflow-y-auto">
        {groups.map(({ key, posts }) => (
          <section key={key} className="flex min-w-0 flex-col gap-2">
            <span className="text-xs font-medium text-muted-foreground">{`:: ${key}`}</span>
            <ul className="flex min-w-0 flex-col gap-2">
              {posts.map((post) => (
                <li key={post.slug} className="group relative min-w-0">
                  <a href={`/posts/${post.slug}`} className="block truncate text-xs font-semibold">
                    <span className="inline-block transition-transform duration-150 group-hover:translate-x-4">
                      {post.title}
                    </span>
                  </a>
                  <div className="pointer-events-none absolute inset-y-0 right-0 w-4 bg-linear-to-l from-background to-transparent" />
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
      {totalPages > 1 && <TagPostsPagination />}
    </div>
  );
}

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/blog", label: "Blog" },
  { href: "/photography", label: "Photography" },
  { href: "/vignettes", label: "Vignettes" },
  { href: "/music", label: "Music" },
];

function PanelNav() {
  return (
    <nav className="flex items-center justify-end">
      <div className="flex flex-col gap-1">
        {NAV_LINKS.map(({ href, label }) => (
          <NavButton key={href} href={href}>
            {label}
          </NavButton>
        ))}
      </div>
    </nav>
  );
}

type SelectedTagPanelProps = {
  selected: Tag | null;
  postsByTag: Record<string, PlainPost[]>;
  allPosts: PlainPost[];
};

export function SelectedTagPanel({ selected, postsByTag, allPosts }: SelectedTagPanelProps) {
  return (
    <div
      data-parallax={60}
      className="absolute top-0 right-8 z-10 grid h-dvh w-sm grid-rows-[2fr_3fr] px-8 py-12 xl:left-218"
    >
      <PanelNav />
      <TagPostsProvider
        key={selected?.tag ?? "blog"}
        selected={selected}
        postsByTag={postsByTag}
        allPosts={allPosts}
      >
        <TagPosts />
      </TagPostsProvider>
    </div>
  );
}
