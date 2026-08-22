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

  const tick = () => {
    if (!reducedRef.current) {
      rotationRef.current += velocityRef.current;
      velocityRef.current *= 0.94;
      if (Math.abs(velocityRef.current) < 0.0005) velocityRef.current = 0;
    } else {
      velocityRef.current = 0;
    }
    placeRef.current(rotationRef.current);
    if (velocityRef.current !== 0 || draggingRef.current) {
      loopRef.current = requestAnimationFrame(tick);
    } else {
      loopRef.current = 0;
    }
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

  const posts = selected ? (postsByTag[selected.tag] ?? []) : [];
  const n = selected ? posts.length : tags.length;

  useLayoutEffect(() => {
    if (radius <= 0) return;
    const base = -Math.PI / 2;
    const flat = 0.62;
    placeRef.current = (angle) => {
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
    placeRef.current(rotationRef.current);
  }, [radius, n, selected, placeRef, rotationRef]);

  return (
    <div className="relative h-dvh w-full overflow-hidden" {...stageProps}>
      <OrbitChrome />
      {selected && (
        <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center">
          <button
            type="button"
            onClick={() => setSelected(null)}
            className="pointer-events-auto text-center"
          >
            <span className="block text-5xl font-bold">{selected.tag}</span>
            <span className="block text-sm text-muted-foreground">
              {selected.count} posts — click to go back
            </span>
          </button>
        </div>
      )}
      {selected
        ? posts.map((post, i) => (
            <a
              key={post.slug}
              ref={(el) => {
                itemRefs.current[i] = el;
              }}
              href={`/posts/${post.slug}`}
              className="absolute top-0 left-0 max-w-56 truncate rounded bg-secondary px-2 py-1 text-sm"
            >
              {post.title}
            </a>
          ))
        : tags.map((t, i) => (
            <TagLink
              key={t.tag}
              ref={(el) => {
                itemRefs.current[i] = el;
              }}
              href={`/tags/${t.tag}`}
              className="absolute top-0 left-0"
              onClick={(e) => {
                e.preventDefault();
                setSelected(t);
              }}
            >
              {t.tag} ({t.count})
            </TagLink>
          ))}
    </div>
  );
}
