import { playSfx } from "@lib/sfx";
import { useEffect, useRef } from "react";

export function useSfxOnChange(value: unknown) {
  const previous = useRef(value);

  useEffect(() => {
    if (Object.is(previous.current, value)) return;
    previous.current = value;
    playSfx();
  }, [value]);
}
