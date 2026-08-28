import type { PlainPost } from "@features/blog/post-data";
import type { Tag } from "@features/tags/tag-data";

import { usePosts } from "@features/tags/posts-context";
import { useState } from "react";

type OrbitItem = Tag | PlainPost;

export type OrbitState = {
  selected: Tag | null;
  items: OrbitItem[];
  n: number;
  select: (tag: Tag) => void;
  back: () => void;
};

export function useOrbitState(): OrbitState {
  const [selected, setSelected] = useState<Tag | null>(null);
  const { tags, postsByTag } = usePosts();
  const items = selected ? (postsByTag[selected.tag] ?? []) : tags;

  return {
    selected,
    items,
    n: items.length,
    select: setSelected,
    back: () => setSelected(null),
  };
}
