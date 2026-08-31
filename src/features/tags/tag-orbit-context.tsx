import type { PlainPost } from "@features/blog/post-data";
import type { Tag } from "@features/tags/tag-data";

import { createContext, useContext, useMemo } from "react";

type MonthGroup = {
  key: string;
  posts: PlainPost[];
};

function groupPostsByMonth(posts: PlainPost[]): MonthGroup[] {
  const map = new Map<string, PlainPost[]>();
  for (const post of posts) {
    const key = post.pubDate.slice(0, 7);
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(post);
  }
  return [...map.entries()].map(([key, groupPosts]) => ({ key, posts: groupPosts }));
}

function useGroupedByTag(postsByTag: Record<string, PlainPost[]>): Record<string, MonthGroup[]> {
  return useMemo(() => {
    const result: Record<string, MonthGroup[]> = {};
    for (const [tag, posts] of Object.entries(postsByTag)) {
      result[tag] = groupPostsByMonth(posts);
    }
    return result;
  }, [postsByTag]);
}

type TagOrbitContextValue = {
  selected: Tag | null;
  postsByTag: Record<string, PlainPost[]>;
  groupedByTag: Record<string, MonthGroup[]>;
  tags: Tag[];
  onSelect: (tag: Tag) => void;
};

const TagOrbitContext = createContext<TagOrbitContextValue | null>(null);

export function useTagOrbit(): TagOrbitContextValue {
  const ctx = useContext(TagOrbitContext);
  if (!ctx) throw new Error("useTagOrbit must be used within <TagOrbit>");
  return ctx;
}

export function TagOrbitProvider({
  tags,
  postsByTag,
  selected,
  onSelect,
  children,
}: {
  tags: Tag[];
  postsByTag: Record<string, PlainPost[]>;
  selected: Tag | null;
  onSelect: (tag: Tag) => void;
  children: React.ReactNode;
}) {
  const groupedByTag = useGroupedByTag(postsByTag);

  return (
    <TagOrbitContext.Provider value={{ selected, postsByTag, groupedByTag, tags, onSelect }}>
      {children}
    </TagOrbitContext.Provider>
  );
}
