import type { ComponentProps } from "react";

import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "cn";

const sectionIndicatorVariants = cva(
  "h-10 w-0.5 shrink-0 transition-[width,background-color] duration-150 motion-reduce:transition-none",
  {
    variants: {
      color: {
        gray: "bg-foreground/30 group-hover:w-3.5 group-hover:bg-foreground/30 group-focus-visible:w-3.5 group-focus-visible:bg-foreground/30",
        taupe:
          "bg-foreground/30 group-hover:w-3.5 group-hover:bg-taupe-400 group-hover:dark:bg-taupe-800 group-focus-visible:w-3.5 group-focus-visible:bg-taupe-400 group-focus-visible:dark:bg-taupe-800",
      },
    },
    defaultVariants: {
      color: "gray",
    },
  },
);

export function SectionIndicator({
  className,
  color,
  ...props
}: ComponentProps<"span"> & VariantProps<typeof sectionIndicatorVariants>) {
  return <span className={cn(sectionIndicatorVariants({ color, className }))} {...props} />;
}
