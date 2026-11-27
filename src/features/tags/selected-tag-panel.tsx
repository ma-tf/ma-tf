import type { PlainPost } from "@features/blog/post-data";
import type { Tag } from "@features/tags/tag-data";

import { NavButton } from "@components/nav-button";
import { TagPostsProvider, useTagPosts } from "@features/tags/tag-posts-context";
import { ArrowLeftIcon, ArrowRightIcon } from "@phosphor-icons/react";
import { useEffect, useRef } from "react";

function TagPostsPagination() {
  const { currentPage, totalPages, goToPage } = useTagPosts();
  return (
    <nav aria-label="Tag posts pages" className="flex w-fit items-center gap-3 md:gap-2">
      <button
        type="button"
        aria-label="Previous page"
        disabled={currentPage === 0}
        onClick={() => goToPage(currentPage - 1)}
        className="grid size-11 shrink-0 cursor-pointer place-items-center rounded-xs text-foreground transition-colors duration-150 hover:text-foreground/70 disabled:cursor-not-allowed disabled:opacity-40 md:size-3.5"
      >
        <ArrowLeftIcon className="size-4 md:size-3.5" aria-hidden="true" />
      </button>
      <span className="text-xs text-muted-foreground">
        {currentPage + 1}/{totalPages}
      </span>
      <button
        type="button"
        aria-label="Next page"
        disabled={currentPage === totalPages - 1}
        onClick={() => goToPage(currentPage + 1)}
        className="grid size-11 shrink-0 cursor-pointer place-items-center rounded-xs text-foreground transition-colors duration-150 hover:text-foreground/70 disabled:cursor-not-allowed disabled:opacity-40 md:size-3.5"
      >
        <ArrowRightIcon className="size-4 md:size-3.5" aria-hidden="true" />
      </button>
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
      <h1 className="text-3xl font-bold">{tagName}</h1>
      <div ref={listRef} className="flex min-h-0 min-w-0 flex-col gap-4 md:overflow-y-auto">
        {groups.map(({ key, posts }) => (
          <section key={key} className="flex min-w-0 flex-col gap-2">
            <span className="text-xs font-medium text-foreground/70 md:text-muted-foreground">{`:: ${key}`}</span>
            <ul className="flex min-w-0 flex-col gap-2">
              {posts.map((post) => (
                <li key={post.slug} data-sfx="hover" className="group relative min-w-0">
                  <a
                    href={`/posts/${post.slug}`}
                    className="flex min-h-11 items-center text-sm font-semibold md:block md:min-h-0 md:truncate md:text-xs"
                  >
                    <span className="inline-block transition-transform duration-150 group-hover:translate-x-4">
                      {post.title}
                    </span>
                  </a>
                  <div className="pointer-events-none absolute inset-y-0 right-0 hidden w-4 bg-linear-to-l from-background to-transparent md:block" />
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
    <nav className="hidden items-center justify-end md:flex">
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
      className="relative z-20 flex w-full flex-col gap-3 px-4 pt-20 pb-8 md:absolute md:top-0 md:right-8 md:z-10 md:grid md:h-dvh md:w-sm md:grid-rows-[2fr_3fr] md:gap-0 md:px-8 md:py-12 xl:left-218"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-20 bg-linear-to-b from-transparent to-background md:hidden"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-20 bottom-0 -z-10 bg-background md:hidden"
      />
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
