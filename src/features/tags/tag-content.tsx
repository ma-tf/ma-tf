import type { PlainPost } from "@features/blog/post-data";
import type { Tag } from "@features/tags/tag-data";

import { ParallaxBackgrounds } from "@features/tags/parallax-backgrounds";
import { SelectedTagPanel } from "@features/tags/selected-tag-panel";
import { TagOrbit } from "@features/tags/tag-orbit";

type TagContentProps = {
  tags: Tag[];
  selected: Tag | null;
  postsByTag: Record<string, PlainPost[]>;
};

export function TagContent({ tags, selected, postsByTag }: TagContentProps) {
  return (
    <div className="relative flex w-7xl flex-1 self-center border-x">
      <ParallaxBackgrounds />
      <TagOrbit tags={tags} selected={selected} />
      <SelectedTagPanel selected={selected} postsByTag={postsByTag} />
    </div>
  );
}
