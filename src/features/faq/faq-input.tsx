import type { ComponentProps } from "react";

import { Input as InputPrimitive } from "@base-ui/react/input";
import { cn } from "cn";
import { useEffect, useState } from "react";

const SAMPLES = [
  "What have you built?",
  "Where is your CV?",
  "What is this site about?",
  "Can AI agents read this site?",
];

const ROTATE_MS = 4000;
const FADE_MS = 150;

function FaqInput({ className, type, value, onFocus, onBlur, ...props }: ComponentProps<"input">) {
  const [sampleIndex, setSampleIndex] = useState(0);
  const [focused, setFocused] = useState(false);
  const [fading, setFading] = useState(false);
  const idle = !focused && !value;
  const placeholder = SAMPLES[sampleIndex] ?? "Ask about this site…";

  useEffect(() => {
    setFading(false);
    if (!idle) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let fadeTimer = 0;
    const timer = window.setInterval(() => {
      setFading(true);
      fadeTimer = window.setTimeout(() => {
        setSampleIndex((index) => (index + 1) % SAMPLES.length);
        setFading(false);
      }, FADE_MS);
    }, ROTATE_MS);
    return () => {
      window.clearInterval(timer);
      window.clearTimeout(fadeTimer);
    };
  }, [idle]);

  return (
    <InputPrimitive
      type={type}
      data-slot="input"
      value={value}
      onFocus={(event) => {
        setFocused(true);
        onFocus?.(event);
      }}
      onBlur={(event) => {
        setFocused(false);
        onBlur?.(event);
      }}
      placeholder={placeholder}
      className={cn(
        "h-auto min-w-0 flex-1 rounded-none border-0 bg-transparent px-0 py-0 text-base shadow-none transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground/70 placeholder:transition-opacity placeholder:duration-300 focus-visible:border-transparent focus-visible:ring-0 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive md:text-base dark:bg-transparent",
        fading && "placeholder:opacity-0",
        className,
      )}
      {...props}
    />
  );
}

export { FaqInput };
