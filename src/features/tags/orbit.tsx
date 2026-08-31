import { useOrbitEngine } from "@features/tags/use-orbit-engine";
import { useItemRefs, useStageRef } from "@hooks/use-orbit";
import { useCallback, useEffect, useEffectEvent } from "react";
const DEG = Math.PI / 180;

type OrbitProps<T> = {
  items: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
  onSelect: (item: T) => void;
  startAngle: number;
  endAngle: number;
  stepDeg: number;
  getKey: (item: T, index: number) => string | number;
  onRotate?: (rotation: number) => void;
  initialRotation: number;
  children?: React.ReactNode;
};

export function Orbit<T>({
  items,
  renderItem,
  onSelect,
  startAngle,
  endAngle,
  stepDeg,
  getKey,
  onRotate,
  initialRotation,
  children,
}: OrbitProps<T>) {
  const { itemRefs, setRef } = useItemRefs(items.length);

  const startRad = startAngle * DEG;
  const arcSize = endAngle * DEG - startRad;
  const step = stepDeg * DEG;
  const totalSpan = items.length * step;

  const stageRef = useStageRef(arcSize, totalSpan, step, startRad);

  const render = (rotation: number) => {
    stageRef.current?.style.setProperty("--rotation", `${rotation}rad`);
    onRotate?.(rotation);
    itemRefs.current.forEach((el, i) => {
      if (!el) return;
      const raw = i * step + rotation;
      const wrapped = ((raw % totalSpan) + totalSpan) % totalSpan;
      const angle = -Math.PI / 2 + startRad + wrapped;
      const depth = (Math.sin(angle) + 1) / 2;
      el.style.zIndex = String(Math.round(depth * items.length));
      el.style.visibility = wrapped < arcSize ? "visible" : "hidden";
    });
  };

  const { nudge, applyWheel, getFrontIndex } = useOrbitEngine(
    items.length,
    arcSize,
    startRad,
    step,
    render,
    initialRotation,
  );

  const onWheelEvent = useEffectEvent((e: WheelEvent) => {
    e.preventDefault();
    applyWheel(e.deltaY);
  });

  useEffect(() => {
    const el = stageRef.current;
    el?.addEventListener("wheel", onWheelEvent, { passive: false });
    return () => el?.removeEventListener("wheel", onWheelEvent);
  }, [stageRef]);

  const onKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
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
    [nudge, getFrontIndex, items, step, onSelect],
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
