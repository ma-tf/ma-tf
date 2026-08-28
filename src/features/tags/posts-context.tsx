import type { PlainPost } from "@features/blog/post-data";
import type { Tag } from "@features/tags/tag-data";

import { createContext, useContext } from "react";

export type PostsContextValue = {
  posts: PlainPost[];
  tags: Tag[];
  postsByTag: Record<string, PlainPost[]>;
};

const PostsContext = createContext<PostsContextValue | null>(null);

export function PostsProvider({
  posts,
  tags,
  postsByTag,
  children,
}: PostsContextValue & { children: React.ReactNode }) {
  return (
    <PostsContext.Provider value={{ posts, tags, postsByTag }}>{children}</PostsContext.Provider>
  );
}

export function usePosts(): PostsContextValue {
  const ctx = useContext(PostsContext);
  if (!ctx) throw new Error("usePosts must be used within PostsProvider");
  return ctx;
}
