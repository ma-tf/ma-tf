import type { PlainPost } from "@features/blog/post-data";
import type { Tag } from "@features/tags/tag-data";

import { applyPositions, computePositions } from "@features/tags/orbit-layout";
import { PostsProvider, type PostsContextValue } from "@features/tags/posts-context";
import { TagLink } from "@features/tags/tags";
import { useOrbitInteraction } from "@features/tags/use-orbit-interaction";
import { useOrbitState } from "@features/tags/use-orbit-state";
import { forwardRef, useCallback, useEffect, useRef, useState } from "react";

// --- constants ---

const EDGE_PADDING = 96;
const DEG_TO_RAD = Math.PI / 180;
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

function SelectedOverlay({ selected, onBack }: { selected: Tag; onBack: () => void }) {
  return (
    <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center">
      <button type="button" onClick={onBack} className="pointer-events-auto text-center">
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

function OrbitItems({
  items,
  itemRefs,
  onSelectTag,
}: {
  items: (Tag | PlainPost)[];
  itemRefs: React.RefObject<(HTMLAnchorElement | null)[]>;
  onSelectTag: (t: Tag) => void;
}) {
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
          <OrbitTagLink key={item.tag} item={item} ref={setRef(i)} onSelectTag={onSelectTag} />
        ) : (
          <OrbitPostLink key={item.slug} item={item} ref={setRef(i)} />
        ),
      )}
    </>
  );
}

// --- main component ---

function OrbitScene({ startDeg, endDeg }: { startDeg: number; endDeg: number }) {
  const stageRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLAnchorElement | null)[]>([]);
  const radius = useStageRadius(stageRef);
  const { selected, items, n, select, back } = useOrbitState();
  const startAngle = startDeg * DEG_TO_RAD;
  const arcSize = (endDeg - startDeg) * DEG_TO_RAD;

  const { getRotation, onKeyDown } = useOrbitInteraction({
    stageRef,
    itemRefs,
    n,
    radius,
    arcSize,
    startAngle,
    items,
    selected,
    onSelect: select,
    onBack: back,
  });

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
      {selected && <SelectedOverlay selected={selected} onBack={back} />}
      <OrbitItems items={items} itemRefs={itemRefs} onSelectTag={select} />
    </div>
  );
}

export function TagOrbit({ tags, postsByTag }: PostsContextValue) {
  return (
    <PostsProvider tags={tags} postsByTag={postsByTag}>
      <OrbitScene startDeg={START_DEG} endDeg={END_DEG} />
    </PostsProvider>
  );
}
