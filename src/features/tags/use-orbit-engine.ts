import { createOrbitEngine, type OrbitEngine } from "@features/tags/orbit-engine";
import { useCallback, useEffect, useRef } from "react";

export function useOrbitEngine(
  n: number,
  arcSize: number,
  startAngle: number,
  reduced: boolean,
  render: (angle: number) => void,
) {
  const engineRef = useRef<OrbitEngine>(null);
  const renderRef = useRef(render);
  renderRef.current = render;

  useEffect(() => {
    engineRef.current = createOrbitEngine({
      n,
      arcSize,
      startAngle,
      reduced,
      render: (rotation) => renderRef.current(rotation),
    });
    return () => engineRef.current?.destroy();
  }, [n, arcSize, startAngle, reduced]);

  const nudge = useCallback((d: number) => engineRef.current?.nudge(d), []);
  const applyWheel = useCallback((d: number) => engineRef.current?.applyWheel(d), []);
  const getRotation = useCallback(() => engineRef.current?.rotation ?? 0, []);

  return { nudge, applyWheel, getRotation };
}
