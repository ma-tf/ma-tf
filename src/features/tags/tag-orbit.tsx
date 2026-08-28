import {
  BASE_ANGLE,
  createOrbitEngine,
  frontIndexFor,
  type OrbitEngine,
} from "@features/tags/orbit-engine";
import { TagLink } from "@features/tags/tags";
import { useReducedMotion } from "@hooks/use-reduced-motion";
import { useCallback, useEffect, useRef, useState } from "react";

// --- types ---

export type Tag = { tag: string; count: number };
export type PlainPost = { slug: string; title: string; description: string; pubDate: string };
type OrbitItem = Tag | PlainPost;

// --- constants ---

const ELLIPSE_FLATNESS = 0.62;
const SCALE_BACK = 0.6;
const SCALE_RANGE = 0.6;
const OPACITY_BACK = 0.35;
const OPACITY_RANGE = 0.65;
const EDGE_PADDING = 96;
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

// --- placement (immutable render boundary: engine calls this each frame) ---

function placeItems(
  itemRefs: React.RefObject<(HTMLAnchorElement | null)[]>,
  n: number,
  radius: number,
  arcSize: number,
  startAngle: number,
  angle: number,
) {
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
}

// --- thin React glue over the engine ---

function useOrbitInput(
  stageRef: React.RefObject<HTMLDivElement | null>,
  config: {
    n: number;
    arcSize: number;
    startAngle: number;
    reduced: boolean;
    render: (angle: number) => void;
  },
) {
  const engineRef = useRef<OrbitEngine>(null);

  useEffect(() => {
    engineRef.current = createOrbitEngine(config);
    return () => engineRef.current?.destroy();
  }, [config.n, config.arcSize, config.startAngle, config.reduced, config.render]);

  useEffect(() => {
    const el = stageRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      engineRef.current?.applyWheel(e.deltaY);
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [stageRef, config.reduced]);

  return {
    nudge: (d: number) => engineRef.current?.nudge(d),
    getRotation: () => engineRef.current?.rotation ?? 0,
  };
}

// --- keyboard handling ---

function useOrbitKeyboard(config: {
  nudge: (d: number) => void;
  getRotation: () => number;
  items: OrbitItem[];
  selected: Tag | null;
  onSelect: (t: Tag) => void;
  onBack: () => void;
  arcSize: number;
  n: number;
  startAngle: number;
}) {
  const { nudge, getRotation, items, selected, onSelect, onBack, arcSize, n, startAngle } = config;

  return useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        nudge(-arcSize / n);
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        nudge(arcSize / n);
      } else if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        const idx = ((frontIndexFor(getRotation(), n, arcSize, startAngle) % n) + n) % n;
        const item = items[idx];
        if (!item) return;
        if (selected && "slug" in item) {
          window.location.href = `/posts/${item.slug}`;
        } else if (!selected && "tag" in item) {
          onSelect(item);
        }
      } else if (e.key === "Escape" && selected) {
        e.preventDefault();
        onBack();
      }
    },
    [nudge, getRotation, items, selected, onSelect, onBack, arcSize, n, startAngle],
  );
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

function OrbitItems({
  items,
  itemRefs,
  onSelectTag,
}: {
  items: OrbitItem[];
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
      {items.map((item, i) => {
        if ("tag" in item) {
          return (
            <TagLink
              key={item.tag}
              ref={setRef(i)}
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
        }
        return (
          <a
            key={item.slug}
            ref={setRef(i)}
            href={`/posts/${item.slug}`}
            className="absolute top-0 left-0 max-w-56 truncate rounded bg-secondary px-2 py-1 text-sm"
          >
            {item.title}
          </a>
        );
      })}
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

  const render = useCallback(
    (angle: number) => placeItems(itemRefs, n, radius, arcSize, startAngle, angle),
    [itemRefs, n, radius, arcSize, startAngle],
  );

  const { nudge, getRotation } = useOrbitInput(stageRef, {
    n,
    arcSize,
    startAngle,
    reduced,
    render,
  });

  const onKeyDown = useOrbitKeyboard({
    nudge,
    getRotation,
    items,
    selected,
    onSelect: setSelected,
    onBack: () => setSelected(null),
    arcSize,
    n,
    startAngle,
  });

  useEffect(() => {
    itemRefs.current.length = n;
    placeItems(itemRefs, n, radius, arcSize, startAngle, getRotation());
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
      {selected && <SelectedOverlay selected={selected} onBack={() => setSelected(null)} />}
      <OrbitItems items={items} itemRefs={itemRefs} onSelectTag={setSelected} />
    </div>
  );
}
