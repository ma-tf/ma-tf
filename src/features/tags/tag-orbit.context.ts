import type { PlainPost } from "@features/blog/post-data";
import type { Tag } from "@features/tags/tag-data";

import { createContext, useContext } from "react";

export type TagOrbitContextValue = {
  selected: Tag | null;
  postsByTag: Record<string, PlainPost[]>;
  tags: Tag[];
  onSelect: (tag: Tag) => void;
};

export const TagOrbitContext = createContext<TagOrbitContextValue | null>(null);

export function useTagOrbit(): TagOrbitContextValue {
  const ctx = useContext(TagOrbitContext);
  if (!ctx) throw new Error("useTagOrbit must be used within <TagOrbit>");
  return ctx;
}
