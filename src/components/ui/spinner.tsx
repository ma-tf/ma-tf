import type { ComponentProps } from "react";

import { cn } from "@lib/cn";
import { CircleNotchIcon } from "@phosphor-icons/react";

function Spinner({ className }: ComponentProps<"svg">) {
  return (
    <CircleNotchIcon
      role="status"
      aria-label="Loading"
      className={cn("size-4 animate-spin", className)}
    />
  );
}

export { Spinner };
