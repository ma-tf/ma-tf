import { useOrbit } from "@features/tags/orbit-context";
import { useRef, useCallback, useEffect } from "react";

export function useItemRefs() {
  const { items } = useOrbit();
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);
  const setRef = useCallback(
    (i: number) => (el: HTMLDivElement | null) => {
      itemRefs.current[i] = el;
    },
    [],
  );
  useEffect(() => {
    itemRefs.current.length = items.length;
  }, [items]);
  return { itemRefs, setRef };
}
