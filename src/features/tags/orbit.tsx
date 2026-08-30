import { useOrbitEngine } from "@features/tags/use-orbit-engine";
import { useItemRefs, useStageRef } from "@hooks/use-orbit";
import { useCallback, useEffect, useEffectEvent } from "react";
import "@features/tags/orbit-layout.css";

const DEG = Math.PI / 180;

type OrbitProps<T> = {
  items: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
  onSelect: (item: T) => void;
  startAngle: number;
  endAngle: number;
  getKey: (item: T, index: number) => string | number;
  children?: React.ReactNode;
};

export function Orbit<T>({
  items,
  renderItem,
  onSelect,
  startAngle,
  endAngle,
  getKey,
  children,
}: OrbitProps<T>) {
  const { itemRefs, setRef } = useItemRefs(items.length);

  const startRad = startAngle * DEG;
  const arcSize = endAngle * DEG - startRad;

  const stageRef = useStageRef(arcSize, items.length, startRad);

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

  const { nudge, applyWheel, getFrontIndex } = useOrbitEngine(
    items.length,
    arcSize,
    startRad,
    render,
  );

  const onWheelEvent = useEffectEvent((e: WheelEvent) => {
    e.preventDefault();
    applyWheel(e.deltaY);
  });

  useEffect(() => {
    stageRef.current?.addEventListener("wheel", onWheelEvent, { passive: false });
    return () => stageRef.current?.removeEventListener("wheel", onWheelEvent);
  }, []);

  const onKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      const step = arcSize / items.length;
      const activateFront = () => {
        const tag = items[getFrontIndex()];
        if (tag) onSelect(tag);
      };
      const handlers: Record<string, () => void> = {
        ArrowLeft: () => nudge(-step),
        ArrowRight: () => nudge(step),
        Enter: activateFront,
        " ": activateFront,
      };
      const handler = handlers[e.key];
      if (handler) {
        e.preventDefault();
        handler();
      }
    },
    [nudge, getFrontIndex, items, arcSize, onSelect],
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
      {children}
      {items.map((item, i) => (
        <div
          key={getKey(item, i)}
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
