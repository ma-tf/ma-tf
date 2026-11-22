import type { PlainPost } from "@features/blog/post-data";
import type { Tag } from "@features/tags/tag-data";

import { ParallaxBackgrounds } from "@features/tags/parallax-backgrounds";
import { SelectedTagPanel } from "@features/tags/selected-tag-panel";
import { TagOrbit } from "@features/tags/tag-orbit";

type TagContentProps = {
  backgroundBaseUrl: string;
  tags: Tag[];
  selected: Tag | null;
  postsByTag: Record<string, PlainPost[]>;
  allPosts: PlainPost[];
};

export function TagContent({
  backgroundBaseUrl,
  tags,
  selected,
  postsByTag,
  allPosts,
}: TagContentProps) {
  return (
    <div className="relative flex w-full max-w-7xl flex-1 flex-col self-center border-x pt-12 md:flex-row md:pt-0">
      <ParallaxBackgrounds baseUrl={backgroundBaseUrl} />
      <div className="relative aspect-video min-h-56 shrink-0 overflow-hidden md:contents">
        <TagOrbit tags={tags} selected={selected} />
      </div>
      <SelectedTagPanel selected={selected} postsByTag={postsByTag} allPosts={allPosts} />
    </div>
  );
}
