import { decideKeyIntent, getActivatedItem } from "@features/tags/orbit-input";
import { computePositions } from "@features/tags/orbit-layout";
import { applyPositions } from "@features/tags/orbit-render";
import { usePosts } from "@features/tags/posts-context";
import { useOrbitEngine } from "@features/tags/use-orbit-engine";
import { useReducedMotion } from "@hooks/use-reduced-motion";
import { useCallback, useEffect } from "react";

export type OrbitInteraction = {
  nudge: (d: number) => void;
  getRotation: () => number;
  onKeyDown: (e: React.KeyboardEvent) => void;
};

export function useOrbitInteraction(config: {
  stageRef: React.RefObject<HTMLDivElement | null>;
  itemRefs: React.RefObject<(HTMLAnchorElement | null)[]>;
  radius: number;
}): OrbitInteraction {
  const { stageRef, itemRefs, radius } = config;
  const { selected, select, back, items, startAngle, arcSize } = usePosts();
  const reduced = useReducedMotion();

  const render = useCallback(
    (angle: number) => {
      const positions = computePositions(items.length, radius, arcSize, startAngle, angle);
      applyPositions(itemRefs, positions);
    },
    [itemRefs, items.length, radius, arcSize, startAngle],
  );

  const { nudge, applyWheel, getRotation } = useOrbitEngine(
    items.length,
    arcSize,
    startAngle,
    reduced,
    render,
  );

  useEffect(() => {
    const el = stageRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      applyWheel(e.deltaY);
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [stageRef, applyWheel]);

  const onKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      const intent = decideKeyIntent(e.key, selected !== null);
      if (intent.type === "none") return;
      e.preventDefault();
      if (intent.type === "nudge") {
        nudge(intent.delta * (arcSize / items.length));
      } else if (intent.type === "activate") {
        const rotation = getRotation();
        const tag = getActivatedItem(rotation, items, items.length, arcSize, startAngle);
        if (tag) select(tag);
      } else if (intent.type === "back") {
        back();
      }
    },
    [nudge, getRotation, arcSize, items.length, startAngle, selected, select, back],
  );

  return { nudge, getRotation, onKeyDown };
}
