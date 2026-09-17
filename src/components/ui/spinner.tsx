import type { ComponentProps } from "react";

import { CircleNotchIcon } from "@phosphor-icons/react";
import { cn } from "cn";

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
