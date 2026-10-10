import type { ComponentProps } from "react";

import { ArrowDownIcon } from "@phosphor-icons/react";
import { cn } from "cn";

export function ScrollCue({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "pointer-events-none absolute right-6 bottom-6 flex animate-scroll-cue items-center gap-1 md:hidden",
        className,
      )}
      {...props}
    >
      <span className="text-2xs tracking-wider uppercase">Scroll down</span>
      <ArrowDownIcon className="size-4" aria-hidden="true" />
    </div>
  );
}
