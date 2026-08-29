import { activateAtFront } from "@features/tags/orbit-input";
import { useOrbitEngine } from "@features/tags/use-orbit-engine";
import { useItemRefs, useStageRef } from "@hooks/use-orbit";
import { useReducedMotion } from "@hooks/use-reduced-motion";
import { useCallback, useRef } from "react";
import "@features/tags/orbit-layout.css";

const DEG = Math.PI / 180;

type OrbitProps<T> = {
  items: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
  onSelect: (item: T) => void;
  startAngle: number;
  endAngle: number;
};

export function Orbit<T>({ items, renderItem, onSelect, startAngle, endAngle }: OrbitProps<T>) {
  const stageRef = useRef<HTMLDivElement>(null);
  const { itemRefs, setRef } = useItemRefs(items.length);
  const reduced = useReducedMotion();

  const startRad = startAngle * DEG;
  const endRad = endAngle * DEG;
  const arcSize = endRad - startRad;

  const render = (rotation: number) => {
    stageRef.current?.style.setProperty("--rotation", `${rotation}rad`);
    const step = arcSize / items.length;
    itemRefs.current.forEach((el, i) => {
      if (!el) return;
      const raw = i * step + rotation;
      const wrapped = ((raw % arcSize) + arcSize) % arcSize;
      const angle = -Math.PI / 2 + startRad + wrapped;
      const depth = (Math.sin(angle) + 1) / 2;
      el.style.zIndex = String(Math.round(depth * items.length));
    });
  };

  const { nudge, applyWheel, getRotation } = useOrbitEngine(
    items.length,
    arcSize,
    startRad,
    reduced,
    render,
  );

  useStageRef(stageRef, applyWheel, arcSize, items.length, startRad);

  const onKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      switch (e.key) {
        case "ArrowLeft":
          e.preventDefault();
          nudge(-arcSize / items.length);
          break;
        case "ArrowRight":
          e.preventDefault();
          nudge(arcSize / items.length);
          break;
        case "Enter":
        case " ":
          e.preventDefault();
          activateAtFront(getRotation(), items, arcSize, startRad, onSelect);
          break;
      }
    },
    [nudge, getRotation, arcSize, items.length, startRad, items, onSelect],
  );

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
        <div
          key={i}
          ref={setRef(i)}
          style={{ "--index": i } as React.CSSProperties}
          className="orbit-item absolute top-0 left-0"
        >
          {renderItem(item, i)}
        </div>
      ))}
    </div>
  );
}
