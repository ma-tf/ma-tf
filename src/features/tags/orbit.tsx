import { useOrbit } from "@features/tags/orbit-context";
import { OrbitScrollbar } from "@features/tags/orbit-scrollbar";
import { useItemRefs } from "@features/tags/use-item-refs";
import { useOrbitEngine } from "@features/tags/use-orbit-engine";
import { useStageRef } from "@features/tags/use-stage-ref";
import { cn } from "@lib/cn";
import { useCallback, useEffect, useEffectEvent, useRef, useState } from "react";

const SCROLLBAR_OFFSET = -64;
const TOUCH_SENSITIVITY = 4;

type OrbitProps<T> = {
  renderItem: (item: T, index: number) => React.ReactNode;
  onSelect: (item: T) => void;
  onRotate?: (rotation: number) => void;
  children?: React.ReactNode;
  style?: React.CSSProperties;
};

export function Orbit<T>({ renderItem, onSelect, onRotate, children, style }: OrbitProps<T>) {
  const { startAngle, arcSize, step, items, getKey } = useOrbit<T>();
  const { itemRefs, setRef } = useItemRefs();
  const totalSpan = items.length * step;

  const { stageRef, radius } = useStageRef();
  const [rotation, setRotation] = useState(0);

  const render = (rotation: number) => {
    stageRef.current?.style.setProperty("--rotation", `${rotation}rad`);
    setRotation(rotation);
    onRotate?.(rotation);
    itemRefs.current.forEach((el, i) => {
      if (!el) return;
      const raw = i * step + rotation;
      const wrapped = ((raw % totalSpan) + totalSpan) % totalSpan;
      const angle = -Math.PI / 2 + startAngle + wrapped;
      const depth = (Math.sin(angle) + 1) / 2;
      el.style.zIndex = String(Math.round(depth * items.length));
      el.style.visibility = wrapped < arcSize ? "visible" : "hidden";
    });
  };

  const { nudge, applyWheel, getFrontIndex } = useOrbitEngine(render);

  const onWheelEvent = useEffectEvent((e: WheelEvent) => {
    e.preventDefault();
    applyWheel(e.deltaY);
  });

  const touchStartY = useRef(0);

  const onTouchStart = useEffectEvent((e: TouchEvent) => {
    if (e.touches.length > 1) return;
    touchStartY.current = e.touches[0]?.clientY ?? 0;
  });

  const onTouchMove = useEffectEvent((e: TouchEvent) => {
    if (e.touches.length > 1) return;
    e.preventDefault();
    const clientY = e.touches[0]?.clientY ?? 0;
    const deltaY = clientY - touchStartY.current;
    applyWheel(deltaY * TOUCH_SENSITIVITY);
    touchStartY.current = clientY;
  });

  useEffect(() => {
    const el = stageRef.current;
    if (!el) return;
    el.addEventListener("wheel", onWheelEvent, { passive: false });
    el.addEventListener("touchstart", onTouchStart, { passive: true });
    el.addEventListener("touchmove", onTouchMove, { passive: false });
    return () => {
      el.removeEventListener("wheel", onWheelEvent);
      el.removeEventListener("touchstart", onTouchStart);
      el.removeEventListener("touchmove", onTouchMove);
    };
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
      className={cn(
        "orbit-stage relative h-dvh w-full overflow-hidden outline-none [--edge-padding:-96px] md:[--edge-padding:96px]",
        "focus-visible:ring-2 focus-visible:ring-ring",
      )}
      style={style}
      tabIndex={0}
      role="group"
      aria-label="Orbit. Use arrow keys to rotate, Enter to select."
      onKeyDown={onKeyDown}
    >
      {children}
      <OrbitScrollbar
        rotation={rotation}
        totalSpan={totalSpan}
        radius={radius}
        offset={SCROLLBAR_OFFSET}
      />
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
