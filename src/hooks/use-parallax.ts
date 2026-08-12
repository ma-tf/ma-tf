import { useIsMobile } from "@hooks/use-mobile";
import { useEffect, useRef, useState } from "react";

export function useParallax(): {
  x: number;
  y: number;
} {
  const isMobile = useIsMobile();
  const intensity = 40;
  const easing = 0.05;
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const target = useRef({ x: 0, y: 0 });
  const current = useRef({ x: 0, y: 0 });
  const raf = useRef(0);

  useEffect(() => {
    if (isMobile) return;

    const onMouseMove = (e: MouseEvent) => {
      const nx = -(e.clientX / window.innerWidth - 0.5) * 2;
      const ny = -(e.clientY / window.innerHeight - 0.5) * 2;
      target.current = { x: nx * intensity, y: ny * intensity };
      if (!raf.current) raf.current = requestAnimationFrame(tick);
    };

    const tick = () => {
      const dx = target.current.x - current.current.x;
      const dy = target.current.y - current.current.y;
      if (Math.abs(dx) < 0.01 && Math.abs(dy) < 0.01) {
        raf.current = 0;
        return;
      }
      current.current.x += dx * easing;
      current.current.y += dy * easing;
      setOffset({ x: current.current.x, y: current.current.y });
      raf.current = requestAnimationFrame(tick);
    };

    window.addEventListener("mousemove", onMouseMove, { passive: true });
    raf.current = requestAnimationFrame(tick);
    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      cancelAnimationFrame(raf.current);
    };
  }, [isMobile]);

  return offset;
}
