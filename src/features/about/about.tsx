import type { ComponentProps } from "react";

import { cn } from "cn";

export function AboutTitle({ className, ...props }: ComponentProps<"h1">) {
  return (
    <h1
      data-parallax-push
      className={cn(
        "animate-fade-in title-fit font-semibold uppercase select-none animation-delay-1200 vertical-text",
        className,
      )}
      {...props}
    />
  );
}
