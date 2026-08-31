import { useOrbit } from "@features/tags/orbit-context";
import { createOrbitEngine, type OrbitEngine } from "@features/tags/orbit-engine";
import { useReducedMotion } from "@hooks/use-reduced-motion";
import { useCallback, useEffect, useRef } from "react";

export function useOrbitEngine(render: (angle: number) => void) {
  const { startAngle, arcSize, step, items, initialRotation } = useOrbit();
  const engineRef = useRef<OrbitEngine>(null);
  const renderRef = useRef(render);
  const reduced = useReducedMotion();

  useEffect(() => {
    renderRef.current = render;
  });

  useEffect(() => {
    engineRef.current = createOrbitEngine({
      n: items.length,
      arcSize,
      startAngle,
      step,
      reduced,
      initialRotation,
      render: (rotation) => renderRef.current(rotation),
    });
    return () => engineRef.current?.destroy();
  }, [items, arcSize, startAngle, step, reduced, initialRotation]);

  const nudge = useCallback((d: number) => engineRef.current?.nudge(d), []);
  const applyWheel = useCallback((d: number) => engineRef.current?.applyWheel(d), []);
  const getFrontIndex = useCallback(() => engineRef.current?.getFrontIndex() ?? 0, []);

  return { nudge, applyWheel, getFrontIndex };
}
