import type { PlainPost } from "@features/blog/post-data";
import type { Tag } from "@features/tags/tag-data";

import { createContext, useContext, useState } from "react";

export type PostsContextValue = {
  tags: Tag[];
  postsByTag: Record<string, PlainPost[]>;
  selected: Tag | null;
  select: (tag: Tag) => void;
  back: () => void;
  items: Tag[];
  startAngle: number;
  arcSize: number;
};

const PostsContext = createContext<PostsContextValue | null>(null);

export function PostsProvider({
  tags,
  postsByTag,
  startDeg,
  endDeg,
  children,
}: {
  tags: Tag[];
  postsByTag: Record<string, PlainPost[]>;
  startDeg: number;
  endDeg: number;
  children: React.ReactNode;
}) {
  const [selected, setSelected] = useState<Tag | null>(null);
  const startAngle = startDeg * (Math.PI / 180);
  const arcSize = (endDeg - startDeg) * (Math.PI / 180);

  return (
    <PostsContext.Provider
      value={{
        tags,
        postsByTag,
        selected,
        select: setSelected,
        back: () => setSelected(null),
        items: tags,
        startAngle,
        arcSize,
      }}
    >
      {children}
    </PostsContext.Provider>
  );
}

export function usePosts(): PostsContextValue {
  const ctx = useContext(PostsContext);
  if (!ctx) throw new Error("usePosts must be used within PostsProvider");
  return ctx;
}
