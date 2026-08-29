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
  const { selected, postsByTag, back } = usePosts();
  if (!selected) return null;
  const posts = postsByTag[selected.tag] ?? [];
  return (
    <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center">
      <div className="pointer-events-auto max-h-[80vh] w-full max-w-2xl overflow-y-auto px-8 text-center">
        <span className="block text-5xl font-bold">{selected.tag}</span>
        <ul className="mt-6 flex flex-col gap-3">
          {posts.map((post) => (
            <li key={post.slug}>
              <a
                href={`/posts/${post.slug}`}
                className="block text-2xl font-semibold underline-offset-4 hover:underline"
              >
                {post.title}
              </a>
            </li>
          ))}
        </ul>
        <button type="button" onClick={back} className="mt-6 text-muted-foreground">
          ← back
        </button>
      </div>
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
      {items.map((item, i) => (
        <OrbitTagLink key={item.tag} item={item} ref={setRef(i)} onSelectTag={select} />
      ))}
    </>
  );
}

// --- main component ---

function OrbitScene() {
  const { items, startAngle, arcSize } = usePosts();
  const stageRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLAnchorElement | null)[]>([]);
  const radius = useStageRadius(stageRef);

  const { getRotation, onKeyDown } = useOrbitInteraction({ stageRef, itemRefs, radius });

  useEffect(() => {
    itemRefs.current.length = items.length;
    const positions = computePositions(items.length, radius, arcSize, startAngle, getRotation());
    applyPositions(itemRefs, positions);
  }, [items.length, radius, arcSize, startAngle, itemRefs, getRotation]);

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

export function TagOrbit({ tags, postsByTag }: Pick<PostsContextValue, "tags" | "postsByTag">) {
  return (
    <PostsProvider tags={tags} postsByTag={postsByTag} startDeg={START_DEG} endDeg={END_DEG}>
      <OrbitScene />
    </PostsProvider>
  );
}
