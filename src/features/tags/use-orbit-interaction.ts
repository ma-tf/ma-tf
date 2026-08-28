import type { PlainPost } from "@features/blog/post-data";
import type { Tag } from "@features/tags/tag-data";

import { createOrbitEngine, frontIndexFor, type OrbitEngine } from "@features/tags/orbit-engine";
import { applyPositions, computePositions } from "@features/tags/orbit-layout";
import { useReducedMotion } from "@hooks/use-reduced-motion";
import { useCallback, useEffect, useRef } from "react";

type OrbitItem = Tag | PlainPost;

export type OrbitInteraction = {
  nudge: (d: number) => void;
  getRotation: () => number;
  onKeyDown: (e: React.KeyboardEvent) => void;
};

export function useOrbitInteraction(config: {
  stageRef: React.RefObject<HTMLDivElement | null>;
  itemRefs: React.RefObject<(HTMLAnchorElement | null)[]>;
  n: number;
  radius: number;
  arcSize: number;
  startAngle: number;
  items: OrbitItem[];
  selected: Tag | null;
  onSelect: (tag: Tag) => void;
  onBack: () => void;
}): OrbitInteraction {
  const { stageRef, itemRefs, n, radius, arcSize, startAngle, items, selected, onSelect, onBack } =
    config;
  const reduced = useReducedMotion();
  const engineRef = useRef<OrbitEngine>(null);

  const render = useCallback(
    (angle: number) => {
      const positions = computePositions(n, radius, arcSize, startAngle, angle);
      applyPositions(itemRefs, positions);
    },
    [itemRefs, n, radius, arcSize, startAngle],
  );

  useEffect(() => {
    engineRef.current = createOrbitEngine({
      n,
      arcSize,
      startAngle,
      reduced,
      render,
    });
    return () => engineRef.current?.destroy();
  }, [n, arcSize, startAngle, reduced, render]);

  useEffect(() => {
    const el = stageRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      engineRef.current?.applyWheel(e.deltaY);
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [stageRef, reduced]);

  const activateFrontItem = useCallback(() => {
    const rotation = engineRef.current?.rotation ?? 0;
    const idx = ((frontIndexFor(rotation, n, arcSize, startAngle) % n) + n) % n;
    const item = items[idx];
    if (!item) return;
    if (selected && "slug" in item) {
      window.location.href = `/posts/${item.slug}`;
    } else if (!selected && "tag" in item) {
      onSelect(item);
    }
  }, [engineRef, arcSize, n, startAngle, items, selected, onSelect]);

  const onKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        engineRef.current?.nudge(-arcSize / n);
        return;
      }
      if (e.key === "ArrowRight") {
        e.preventDefault();
        engineRef.current?.nudge(arcSize / n);
        return;
      }
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        activateFrontItem();
        return;
      }
      if (e.key === "Escape" && selected) {
        e.preventDefault();
        onBack();
      }
    },
    [engineRef, arcSize, n, activateFrontItem, selected, onBack],
  );

  return {
    nudge: (d: number) => engineRef.current?.nudge(d),
    getRotation: () => engineRef.current?.rotation ?? 0,
    onKeyDown,
  };
}
