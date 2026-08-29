import { activateAtFront, decideKeyIntent } from "@features/tags/orbit-input";
import { useOrbitEngine } from "@features/tags/use-orbit-engine";
import { useReducedMotion } from "@hooks/use-reduced-motion";
import { useCallback, useEffect, useRef, useState } from "react";
import "@features/tags/orbit-layout.css";

const DEG = Math.PI / 180;

export type OrbitProps<T> = {
  items: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
  onSelect: (item: T) => void;
  startAngle: number;
  endAngle: number;
};

export function Orbit<T>({ items, renderItem, onSelect, startAngle, endAngle }: OrbitProps<T>) {
  const stageRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);
  const reduced = useReducedMotion();

  const startRad = startAngle * DEG;
  const endRad = endAngle * DEG;
  const arcSize = endRad - startRad;

  const [radius, setRadius] = useState(0);
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

  const setRef = useCallback(
    (i: number) => (el: HTMLDivElement | null) => {
      itemRefs.current[i] = el;
    },
    [],
  );

  const render = useCallback(
    (rotation: number) => {
      const step = arcSize / items.length;
      itemRefs.current.forEach((el, i) => {
        if (!el) return;
        const raw = i * step + rotation;
        const wrapped = ((raw % arcSize) + arcSize) % arcSize;
        const angle = -Math.PI / 2 + startRad + wrapped;
        const depth = (Math.sin(angle) + 1) / 2;
        const wraps = Math.floor(raw / arcSize);
        el.style.setProperty("--angle", `${angle}rad`);
        el.style.zIndex = String(Math.round((depth - wraps) * 10));
      });
    },
    [items.length, arcSize, startRad],
  );

  const { nudge, applyWheel, getRotation } = useOrbitEngine(
    items.length,
    arcSize,
    startRad,
    reduced,
    render,
  );

  useEffect(() => {
    render(0);
  }, [render]);

  useEffect(() => {
    const el = stageRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      applyWheel(e.deltaY);
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [applyWheel]);

  const onKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      const intent = decideKeyIntent(e.key);
      if (intent.type === "none") return;
      e.preventDefault();
      if (intent.type === "nudge") {
        nudge(intent.delta * (arcSize / items.length));
      } else if (intent.type === "activate") {
        activateAtFront(getRotation, items, items.length, arcSize, startRad, onSelect);
      }
    },
    [nudge, getRotation, arcSize, items.length, startRad, items, onSelect],
  );

  useEffect(() => {
    itemRefs.current.length = items.length;
  }, [items.length]);

  useEffect(() => {
    stageRef.current?.style.setProperty("--radius", `${radius}px`);
  }, [radius]);

  return (
    <div
      ref={stageRef}
      className="orbit-stage relative h-dvh w-full overflow-hidden outline-none focus-visible:ring-2 focus-visible:ring-ring"
      tabIndex={0}
      role="group"
      aria-label="Orbit. Use arrow keys to rotate, Enter to select."
      onKeyDown={onKeyDown}
    >
      {items.map((item, i) => (
        <div key={i} ref={setRef(i)} className="orbit-item absolute top-0 left-0">
          {renderItem(item, i)}
        </div>
      ))}
    </div>
  );
}
