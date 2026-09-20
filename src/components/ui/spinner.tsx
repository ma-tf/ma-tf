import type { ComponentProps } from "react";

import { CircleNotchIcon } from "@phosphor-icons/react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "cn";

const spinnerVariants = cva("animate-spin", {
  variants: {
    size: {
      sm: "size-3",
      default: "size-4",
      lg: "size-6",
      xl: "size-8",
    },
  },
  defaultVariants: { size: "default" },
});

function Spinner({
  className,
  size,
}: ComponentProps<"svg"> & VariantProps<typeof spinnerVariants>) {
  return (
    <CircleNotchIcon
      role="status"
      aria-label="Loading"
      className={cn(spinnerVariants({ size, className }))}
    />
  );
}

export { Spinner };
