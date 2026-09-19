import type { PlainPost } from "@features/blog/post-data";
import type { Tag } from "@features/tags/tag-data";

import { ParallaxBackgrounds } from "@features/tags/parallax-backgrounds";
import { SelectedTagPanel } from "@features/tags/selected-tag-panel";
import { TagOrbit } from "@features/tags/tag-orbit";
import { useParallax } from "@hooks/use-parallax";

type TagContentProps = {
  backgroundBaseUrl: string;
  tags: Tag[];
  selected: Tag | null;
  postsByTag: Record<string, PlainPost[]>;
};

export function TagContent({ backgroundBaseUrl, tags, selected, postsByTag }: TagContentProps) {
  const offset = useParallax();

  return (
    <div
      className="relative flex w-full max-w-7xl flex-1 self-center border-x"
      style={
        {
          "--parallax-x": `${offset.x}px`,
          "--parallax-y": `${offset.y}px`,
        } as React.CSSProperties
      }
    >
      <ParallaxBackgrounds baseUrl={backgroundBaseUrl} />
      <TagOrbit tags={tags} selected={selected} />
      <SelectedTagPanel selected={selected} postsByTag={postsByTag} />
    </div>
  );
}
