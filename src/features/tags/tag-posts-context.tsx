import type { PlainPost } from "@features/blog/post-data";
import type { Tag } from "@features/tags/tag-data";

import { createContext, useContext, useMemo, useState, type ReactNode } from "react";

const TAG_POSTS_PAGE_SIZE = 10;

export type TagPostsMonthGroup = {
  key: string;
  posts: PlainPost[];
};

export type TagPostsValue = {
  tagName: string;
  groups: TagPostsMonthGroup[];
  currentPage: number;
  totalPages: number;
  goToPage: (page: number) => void;
};

function groupPostsByMonth(posts: PlainPost[]): TagPostsMonthGroup[] {
  const map = new Map<string, PlainPost[]>();
  for (const post of posts) {
    const key = post.publicationDate.slice(0, 7);
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(post);
  }
  return [...map.entries()].map(([key, groupPosts]) => ({ key, posts: groupPosts }));
}

const TagPostsContext = createContext<TagPostsValue | null>(null);

export function TagPostsProvider({
  selected,
  postsByTag,
  allPosts,
  children,
}: {
  selected: Tag | null;
  postsByTag: Record<string, PlainPost[]>;
  allPosts: PlainPost[];
  children: ReactNode;
}) {
  const tagName = selected ? selected.tag : "blog";
  const posts = (selected && postsByTag[selected.tag]) ?? allPosts;
  const totalPages = Math.max(1, Math.ceil(posts.length / TAG_POSTS_PAGE_SIZE));
  const [page, setPage] = useState(0);

  const currentPage = page;
  const value = useMemo<TagPostsValue>(() => {
    const pagePosts = posts.slice(
      currentPage * TAG_POSTS_PAGE_SIZE,
      (currentPage + 1) * TAG_POSTS_PAGE_SIZE,
    );
    const goToPage = (next: number) => {
      setPage(Math.min(Math.max(next, 0), totalPages - 1));
    };
    return {
      tagName,
      groups: groupPostsByMonth(pagePosts),
      currentPage,
      totalPages,
      goToPage,
    };
  }, [posts, currentPage, totalPages, tagName]);

  return <TagPostsContext.Provider value={value}>{children}</TagPostsContext.Provider>;
}

export function useTagPosts(): TagPostsValue {
  const context = useContext(TagPostsContext);
  if (!context) {
    throw new Error("useTagPosts must be used within TagPostsProvider");
  }

  return context;
}
