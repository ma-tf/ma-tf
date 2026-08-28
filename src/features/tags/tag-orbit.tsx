import { TagLink } from "@features/tags/tags";
import { useReducedMotion } from "@hooks/use-reduced-motion";
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";

// --- types ---

export type Tag = { tag: string; count: number };
export type PlainPost = { slug: string; title: string; description: string; pubDate: string };

// --- constants ---

const WHEEL_SENSITIVITY = 0.00003;
const FRICTION = 0.94;
const STOP_THRESHOLD = 0.0005;
const ELLIPSE_FLATNESS = 0.62;
const SCALE_BACK = 0.6;
const SCALE_RANGE = 0.6;
const OPACITY_BACK = 0.35;
const OPACITY_RANGE = 0.65;
const EDGE_PADDING = 96;
const BASE_ANGLE = -Math.PI / 2;
const SNAP_DURATION = 400;
const DEG_TO_RAD = Math.PI / 180;

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

// --- orbit input: physics + pointer/wheel ---

type PlaceFn = (angle: number) => void;

function useOrbitInput(
  stageRef: React.RefObject<HTMLDivElement | null>,
  reduced: boolean,
  n: number,
  arcSize: number,
  startAngle: number,
) {
  const rotationRef = useRef(0);
  const velocityRef = useRef(0);
  const placeRef = useRef<PlaceFn>(() => {});
  const loopRef = useRef(0);
  const targetRotationRef = useRef<number | null>(null);
  const snapStartRef = useRef<number | null>(null);

  const step = arcSize / n;

  const snapToNearest = useCallback(() => {
    const current = rotationRef.current;
    const nearest =
      Math.round((current + BASE_ANGLE - startAngle) / step) * step - BASE_ANGLE + startAngle;
    if (Math.abs(nearest - current) < 0.001) return;
    if (reduced) {
      rotationRef.current = nearest;
      placeRef.current(nearest);
      return;
    }
    snapStartRef.current = current;
    targetRotationRef.current = nearest;
  }, [step, reduced]);

  const stopLoop = () => {
    if (loopRef.current) {
      cancelAnimationFrame(loopRef.current);
      loopRef.current = 0;
    }
  };

  const applyRotation = useCallback(() => {
    placeRef.current(rotationRef.current);
  }, []);

  const tick = useCallback(() => {
    if (targetRotationRef.current !== null) {
      const start = snapStartRef.current!;
      const elapsed = performance.now() - start;
      const t = Math.min(1, elapsed / SNAP_DURATION);
      const eased = 1 - Math.pow(1 - t, 3);
      rotationRef.current = start + (targetRotationRef.current - start) * eased;
      applyRotation();
      if (t >= 1 || Math.abs(rotationRef.current - targetRotationRef.current) < 0.001) {
        rotationRef.current = targetRotationRef.current;
        targetRotationRef.current = null;
        snapStartRef.current = null;
        applyRotation();
        loopRef.current = 0;
        return;
      }
      loopRef.current = requestAnimationFrame(tick);
      return;
    }

    rotationRef.current += velocityRef.current;
    velocityRef.current *= FRICTION;
    if (Math.abs(velocityRef.current) < STOP_THRESHOLD) {
      velocityRef.current = 0;
    }

    applyRotation();

    if (velocityRef.current === 0) {
      snapToNearest();
      loopRef.current = 0;
      return;
    }

    loopRef.current = requestAnimationFrame(tick);
  }, [applyRotation, snapToNearest]);

  const ensureLoop = useCallback(() => {
    if (!loopRef.current) {
      loopRef.current = requestAnimationFrame(tick);
    }
  }, [tick]);

  useEffect(() => {
    const el = stageRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      if (reduced) return;
      velocityRef.current += e.deltaY * WHEEL_SENSITIVITY;
      targetRotationRef.current = null;
      ensureLoop();
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [stageRef, reduced, ensureLoop]);

  const nudge = useCallback(
    (delta: number) => {
      targetRotationRef.current = null;
      rotationRef.current += delta;
      applyRotation();
    },
    [applyRotation],
  );

  useEffect(() => stopLoop, []);

  return {
    rotationRef,
    placeRef,
    nudge,
  };
}

// --- placement ---

function createPlacer({
  n,
  radius,
  itemRefs,
  arcSize,
  startAngle,
}: {
  n: number;
  radius: number;
  itemRefs: React.RefObject<(HTMLAnchorElement | null)[]>;
  arcSize: number;
  startAngle: number;
}): PlaceFn {
  if (radius <= 0) return () => {};
  return (angle) => {
    for (let i = 0; i < n; i++) {
      const el = itemRefs.current[i];
      if (!el) continue;
      const raw = (i / n) * arcSize + angle;
      const wrapped = ((raw % arcSize) + arcSize) % arcSize;
      const a = BASE_ANGLE + startAngle + wrapped;
      const x = radius * Math.cos(a);
      const y = radius * ELLIPSE_FLATNESS * Math.sin(a);
      const depth = (Math.sin(a) + 1) / 2;
      const scale = SCALE_BACK + SCALE_RANGE * depth;
      const opacity = OPACITY_BACK + OPACITY_RANGE * depth;
      el.style.transform = `translate(-50%, -50%) translate(${x}px, ${y}px) scale(${scale})`;
      el.style.opacity = String(opacity);
      el.style.zIndex = String(Math.round(depth * 10));
    }
  };
}

// --- subcomponents ---

function OrbitChrome() {
  return (
    <>
      <h1 className="absolute top-6 left-8 z-20 text-4xl font-bold">Tags</h1>
      <p className="absolute bottom-6 left-8 z-20 text-xs text-muted-foreground">
        scroll to rotate — use arrow keys when focused — click a tag to focus it
      </p>
    </>
  );
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

function OrbitItems({
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
  const setRef = useCallback(
    (i: number) => (el: HTMLAnchorElement | null) => {
      itemRefs.current[i] = el;
    },
    [itemRefs],
  );

  if (!selected) {
    return (
      <>
        {tags.map((t, i) => (
          <TagLink
            key={t.tag}
            ref={setRef(i)}
            href={`/tags/${t.tag}`}
            className="absolute top-0 left-0"
            onClick={(e) => {
              e.preventDefault();
              onSelectTag(t);
            }}
          >
            {t.tag} ({t.count})
          </TagLink>
        ))}
      </>
    );
  }

  return (
    <>
      {posts.map((post, i) => (
        <a
          key={post.slug}
          ref={setRef(i)}
          href={`/posts/${post.slug}`}
          className="absolute top-0 left-0 max-w-56 truncate rounded bg-secondary px-2 py-1 text-sm"
        >
          {post.title}
        </a>
      ))}
    </>
  );
}

// --- main component ---

export function TagOrbit({
  tags,
  postsByTag,
  startDeg = 0,
  endDeg = 360,
}: {
  tags: Tag[];
  postsByTag: Record<string, PlainPost[]>;
  startDeg?: number;
  endDeg?: number;
}) {
  const stageRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLAnchorElement | null)[]>([]);
  const [selected, setSelected] = useState<Tag | null>(null);
  const reduced = useReducedMotion();
  const radius = useStageRadius(stageRef);
  const items = selected ? (postsByTag[selected.tag] ?? []) : tags;
  const n = items.length;
  const startAngle = startDeg * DEG_TO_RAD;
  const arcSize = (endDeg - startDeg) * DEG_TO_RAD;
  const { rotationRef, placeRef, nudge } = useOrbitInput(stageRef, reduced, n, arcSize, startAngle);

  useLayoutEffect(() => {
    itemRefs.current.length = n;
    const place = createPlacer({ n, radius, itemRefs, arcSize, startAngle });
    placeRef.current = place;
    placeRef.current(rotationRef.current);
  }, [n, radius, placeRef, rotationRef, arcSize, startAngle]);

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowLeft") {
      e.preventDefault();
      nudge(-arcSize / n);
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      nudge(arcSize / n);
    } else if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      const frontIndex = Math.round((Math.PI - startAngle - rotationRef.current) / (arcSize / n));
      const idx = ((frontIndex % n) + n) % n;
      const item = items[idx];
      if (!item) return;
      if (selected && "slug" in item) {
        window.location.href = `/posts/${item.slug}`;
      } else if (!selected && "tag" in item) {
        setSelected(item);
      }
    } else if (e.key === "Escape" && selected) {
      e.preventDefault();
      setSelected(null);
    }
  };

  return (
    <div
      ref={stageRef}
      className="relative h-dvh w-full overflow-hidden outline-none focus-visible:ring-2 focus-visible:ring-ring"
      tabIndex={0}
      role="group"
      aria-label="Tag orbit. Use left and right arrow keys to rotate, Enter to select, Escape to go back."
      onKeyDown={onKeyDown}
    >
      <OrbitChrome />
      {selected && <SelectedOverlay selected={selected} onBack={() => setSelected(null)} />}
      <OrbitItems
        selected={selected}
        posts={postsByTag[selected?.tag ?? ""] ?? []}
        tags={tags}
        itemRefs={itemRefs}
        onSelectTag={setSelected}
      />
    </div>
  );
}
