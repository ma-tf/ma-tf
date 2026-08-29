import { useState, useEffect, useRef, useCallback, useEffectEvent, type RefObject } from "react";

export function useStageRef(
  stageRef: RefObject<HTMLDivElement | null>,
  applyWheel: (deltaY: number) => void,
  arcSize: number,
  itemsLength: number,
  startAngle: number,
) {
  const [radius, setRadius] = useState(0);

  const onWheelEvent = useEffectEvent((e: WheelEvent) => {
    e.preventDefault();
    applyWheel(e.deltaY);
  });

  // Measure radius + attach wheel listener on mount.
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
    el.addEventListener("wheel", onWheelEvent, { passive: false });
    return () => {
      ro.disconnect();
      el.removeEventListener("wheel", onWheelEvent);
    };
  }, []);

  const configEvent = useEffectEvent(() => {
    const el = stageRef.current;
    if (!el) return;
    el.style.setProperty("--step", `${arcSize / itemsLength}rad`);
    el.style.setProperty("--arc-size", `${arcSize}rad`);
    el.style.setProperty("--start-angle", `${startAngle}rad`);
  });

  useEffect(() => {
    stageRef.current?.style.setProperty("--radius", `${radius}px`);
    configEvent();
  }, [radius]);
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
