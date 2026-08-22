import type { MouseEvent as ReactMouseEvent, PointerEvent as ReactPointerEvent } from "react";

import { TagLink } from "@components/tags";
import { useEffect, useLayoutEffect, useRef, useState } from "react";

export type Tag = { tag: string; count: number };
export type PlainPost = { slug: string; title: string; description: string; pubDate: string };

type PlaceFn = (angle: number) => void;

const DRAG_SENS = 0.0006; // radians per pixel of horizontal drag

function useOrbitInput() {
  const stageRef = useRef<HTMLDivElement>(null);
  const rotationRef = useRef(0);
  const velocityRef = useRef(0);
  const placeRef = useRef<PlaceFn>(() => {});
  const [radius, setRadius] = useState(0);
  const draggingRef = useRef(false);
  const lastXRef = useRef(0);
  const suppressClickRef = useRef(false);
  const loopRef = useRef(0);
  const reducedRef = useRef(false);

  useEffect(() => {
    const el = stageRef.current;
    if (!el) return;
    const measure = () => {
      const { width, height } = el.getBoundingClientRect();
      setRadius(Math.max(0, Math.min(width, height) / 2 - 96));
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => (reducedRef.current = mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  const startLoop = () => {
    if (!loopRef.current) loopRef.current = requestAnimationFrame(tick);
  };

  const advanceRotation = () => {
    if (reducedRef.current) {
      velocityRef.current = 0;
      return;
    }
    rotationRef.current += velocityRef.current;
    velocityRef.current *= 0.94;
    if (Math.abs(velocityRef.current) < 0.0005) velocityRef.current = 0;
  };

  const scheduleFrame = () => {
    const active = velocityRef.current !== 0 || draggingRef.current;
    loopRef.current = active ? requestAnimationFrame(tick) : 0;
  };

  const tick = () => {
    advanceRotation();
    placeRef.current(rotationRef.current);
    scheduleFrame();
  };

  useEffect(() => {
    const el = stageRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      velocityRef.current += e.deltaY * 0.00003;
      startLoop();
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, []);

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      if (!draggingRef.current) return;
      const dx = e.clientX - lastXRef.current;
      lastXRef.current = e.clientX;
      const delta = dx * DRAG_SENS;
      rotationRef.current -= delta;
      if (Math.abs(dx) > 3) suppressClickRef.current = true;
      velocityRef.current = -delta * 1.5;
      placeRef.current(rotationRef.current);
    };
    const onUp = () => {
      draggingRef.current = false;
    };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };
  }, []);

  const onPointerDown = (e: ReactPointerEvent) => {
    draggingRef.current = true;
    lastXRef.current = e.clientX;
    suppressClickRef.current = false;
    startLoop();
  };

  const onClickCapture = (e: ReactMouseEvent) => {
    if (suppressClickRef.current) {
      e.preventDefault();
      e.stopPropagation();
    }
  };

  return {
    stageProps: {
      ref: stageRef,
      style: { touchAction: "none" as const },
      onPointerDown,
      onClickCapture,
    },
    radius,
    placeRef,
    rotationRef,
  };
}

function OrbitChrome() {
  return (
    <>
      <h1 className="absolute top-6 left-8 z-20 text-4xl font-bold">Tags</h1>
      <p className="absolute bottom-6 left-8 z-20 text-xs text-muted-foreground">
        scroll or drag to rotate — click a tag to focus it
      </p>
    </>
  );
}

function createPlacer({
  n,
  radius,
  itemRefs,
}: {
  n: number;
  radius: number;
  itemRefs: React.RefObject<(HTMLAnchorElement | null)[]>;
}): PlaceFn {
  const base = -Math.PI / 2;
  const flat = 0.62;
  if (radius <= 0) return () => {};
  return (angle) => {
    itemRefs.current.forEach((el, i) => {
      if (!el) return;
      const a = base + (i / n) * Math.PI * 2 + angle;
      const x = radius * Math.cos(a);
      const y = radius * flat * Math.sin(a);
      const depth = (Math.sin(a) + 1) / 2;
      const scale = 0.6 + 0.6 * depth;
      el.style.transform = `translate(-50%, -50%) translate(${x}px, ${y}px) scale(${scale})`;
      el.style.opacity = String(0.35 + 0.65 * depth);
      el.style.zIndex = String(Math.round(depth * 10));
    });
  };
}

const setItemRef =
  (itemRefs: React.RefObject<(HTMLAnchorElement | null)[]>, i: number) =>
  (el: HTMLAnchorElement | null) => {
    itemRefs.current[i] = el;
  };

function orbitData(
  selected: Tag | null,
  postsByTag: Record<string, PlainPost[]>,
  tags: Tag[],
): { posts: PlainPost[]; n: number } {
  if (!selected) return { posts: [], n: tags.length };
  const posts = postsByTag[selected.tag] ?? [];
  return { posts, n: posts.length };
}

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

function renderItems({
  selected,
  posts,
  tags,
  itemRefs,
  onSelectTag,
}: {
  selected: Tag | null;
  posts: PlainPost[];
  tags: Tag[];
  itemRefs: React.RefObject<(HTMLAnchorElement | null)[]>;
  onSelectTag: (t: Tag) => void;
}) {
  if (!selected) {
    return tags.map((t, i) => (
      <TagLink
        key={t.tag}
        ref={setItemRef(itemRefs, i)}
        href={`/tags/${t.tag}`}
        className="absolute top-0 left-0"
        onClick={(e) => {
          e.preventDefault();
          onSelectTag(t);
        }}
      >
        {t.tag} ({t.count})
      </TagLink>
    ));
  }
  return posts.map((post, i) => (
    <a
      key={post.slug}
      ref={setItemRef(itemRefs, i)}
      href={`/posts/${post.slug}`}
      className="absolute top-0 left-0 max-w-56 truncate rounded bg-secondary px-2 py-1 text-sm"
    >
      {post.title}
    </a>
  ));
}

export function TagOrbit({
  tags,
  postsByTag,
}: {
  tags: Tag[];
  postsByTag: Record<string, PlainPost[]>;
}) {
  const { stageProps, radius, placeRef, rotationRef } = useOrbitInput();
  const itemRefs = useRef<(HTMLAnchorElement | null)[]>([]);
  const [selected, setSelected] = useState<Tag | null>(null);

  const { posts, n } = orbitData(selected, postsByTag, tags);

  useLayoutEffect(() => {
    placeRef.current = createPlacer({ n, radius, itemRefs });
    placeRef.current(rotationRef.current);
  }, [radius, n, placeRef, rotationRef]);

  return (
    <div className="relative h-dvh w-full overflow-hidden" {...stageProps}>
      <OrbitChrome />
      {selected && <SelectedOverlay selected={selected} onBack={() => setSelected(null)} />}
      {renderItems({ selected, posts, tags, itemRefs, onSelectTag: setSelected })}
    </div>
  );
}
