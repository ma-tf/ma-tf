import { useState, useEffect, useRef, useCallback, useEffectEvent } from "react";

export function useStageRef(arcSize: number, totalSpan: number, step: number, startAngle: number) {
  const [radius, setRadius] = useState(0);
  const stageRef = useRef<HTMLDivElement>(null);

  // Measure radius on mount.
  useEffect(() => {
    const el = stageRef.current;
    if (!el) return;
    const measure = () => {
      const { width, height } = el.getBoundingClientRect();
      const padding = parseFloat(getComputedStyle(el).getPropertyValue("--edge-padding")) || 96;
      setRadius(Math.max(0, Math.min(width, height) / 2 - padding));
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const configEvent = useEffectEvent(() => {
    const el = stageRef.current;
    if (!el) return;
    el.style.setProperty("--step", `${step}rad`);
    el.style.setProperty("--arc-size", `${arcSize}rad`);
    el.style.setProperty("--total-span", `${totalSpan}rad`);
    el.style.setProperty("--start-angle", `${startAngle}rad`);
  });

  useEffect(() => {
    stageRef.current?.style.setProperty("--radius", `${radius}px`);
    configEvent();
  }, [radius]);

  return stageRef;
}

export function useItemRefs(itemsLength: number) {
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);
  const setRef = useCallback(
    (i: number) => (el: HTMLDivElement | null) => {
      itemRefs.current[i] = el;
    },
    [],
  );
  useEffect(() => {
    itemRefs.current.length = itemsLength;
  }, [itemsLength]);
  return { itemRefs, setRef };
}
