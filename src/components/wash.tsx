import type { ComponentProps } from "react";

import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "cn";

const washVariants = cva(
  "pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-150 ease-out motion-reduce:transition-none",
  {
    variants: {
      color: {
        gray: "bg-linear-to-l from-foreground/25 to-transparent",
        taupe: "bg-linear-to-l from-taupe-400/50 to-transparent to-75% dark:from-taupe-800/50",
        blue: "bg-linear-to-l from-vignettes-400/50 to-transparent to-75% dark:from-vignettes-800/50",
        emerald: "bg-linear-to-l from-emerald-100 to-transparent dark:from-emerald-900",
        ember: "bg-linear-to-l from-ember-400/60 to-transparent dark:from-ember-800/60",
      },
    },
    defaultVariants: {
      color: "gray",
    },
  },
);

export function Wash({
  className,
  color,
  ...props
}: ComponentProps<"span"> & VariantProps<typeof washVariants>) {
  return (
    <span
      aria-hidden="true"
      data-wash={color ?? "gray"}
      className={cn(washVariants({ color, className }))}
      {...props}
    />
  );
}
