import type { PlainPost } from "@features/blog/post-data";
import type { Tag } from "@features/tags/tag-data";

import { computePositions } from "@features/tags/orbit-layout";
import { applyPositions } from "@features/tags/orbit-render";
import { PostsProvider, usePosts, type PostsContextValue } from "@features/tags/posts-context";
import { TagLink } from "@features/tags/tags";
import { useOrbitInteraction } from "@features/tags/use-orbit-interaction";
import { forwardRef, useCallback, useEffect, useRef, useState } from "react";

// --- constants ---

const EDGE_PADDING = 96;
const START_DEG = 100;
const END_DEG = 170;

// --- sizing ---

function useStageRadius(ref: React.RefObject<HTMLDivElement | null>): number {
  const [radius, setRadius] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const measure = () => {
      const { width, height } = el.getBoundingClientRect();
      setRadius(Math.max(0, Math.min(width, height) / 2 - EDGE_PADDING));
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [ref]);

  return radius;
}

// --- subcomponents ---

function SelectedOverlay() {
  const { selected, back } = usePosts();
  if (!selected) return null;
  return (
    <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center">
      <button type="button" onClick={back} className="pointer-events-auto text-center">
        <span className="block text-5xl font-bold">{selected.tag}</span>
        <span className="block text-sm text-muted-foreground">
          {selected.count} posts — click to go back
        </span>
      </button>
    </div>
  );
}

const OrbitTagLink = forwardRef(function OrbitTagLink(
  { item, onSelectTag }: { item: Tag; onSelectTag: (t: Tag) => void },
  ref: React.Ref<HTMLAnchorElement>,
) {
  return (
    <TagLink
      ref={ref}
      href={`/tags/${item.tag}`}
      className="absolute top-0 left-0"
      onClick={(e) => {
        e.preventDefault();
        onSelectTag(item);
      }}
    >
      {item.tag} ({item.count})
    </TagLink>
  );
});

const OrbitPostLink = forwardRef(function OrbitPostLink(
  { item }: { item: PlainPost },
  ref: React.Ref<HTMLAnchorElement>,
) {
  return (
    <a
      ref={ref}
      href={`/posts/${item.slug}`}
      className="absolute top-0 left-0 max-w-56 truncate rounded bg-secondary px-2 py-1 text-sm"
    >
      {item.title}
    </a>
  );
});

function OrbitItems({ itemRefs }: { itemRefs: React.RefObject<(HTMLAnchorElement | null)[]> }) {
  const { items, select } = usePosts();

  const setRef = useCallback(
    (i: number) => (el: HTMLAnchorElement | null) => {
      itemRefs.current[i] = el;
    },
    [itemRefs],
  );

  return (
    <>
      {items.map((item, i) =>
        "tag" in item ? (
          <OrbitTagLink key={item.tag} item={item} ref={setRef(i)} onSelectTag={select} />
        ) : (
          <OrbitPostLink key={item.slug} item={item} ref={setRef(i)} />
        ),
      )}
    </>
  );
}

// --- main component ---

function OrbitScene() {
  const { n, startAngle, arcSize } = usePosts();
  const stageRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLAnchorElement | null)[]>([]);
  const radius = useStageRadius(stageRef);

  const { getRotation, onKeyDown } = useOrbitInteraction({ stageRef, itemRefs, radius });

  useEffect(() => {
    itemRefs.current.length = n;
    const positions = computePositions(n, radius, arcSize, startAngle, getRotation());
    applyPositions(itemRefs, positions);
  }, [n, radius, arcSize, startAngle, itemRefs, getRotation]);

  return (
    <div
      ref={stageRef}
      className="relative h-dvh w-full overflow-hidden outline-none focus-visible:ring-2 focus-visible:ring-ring"
      tabIndex={0}
      role="group"
      aria-label="Tag orbit. Use left and right arrow keys to rotate, Enter to select, Escape to go back."
      onKeyDown={onKeyDown}
    >
      <SelectedOverlay />
      <OrbitItems itemRefs={itemRefs} />
    </div>
  );
}

export function TagOrbit({ tags, postsByTag }: PostsContextValue) {
  return (
    <PostsProvider tags={tags} postsByTag={postsByTag} startDeg={START_DEG} endDeg={END_DEG}>
      <OrbitScene />
    </PostsProvider>
  );
}
