import type { ComponentProps } from "react";

import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "cn";

const sectionIndicatorVariants = cva(
  "h-10 w-0.5 shrink-0 bg-foreground/30 transition-[width,background-color] duration-150 group-has-[[data-title]:focus-within]:w-3.5 group-has-[[data-title]:hover]:w-3.5 motion-reduce:transition-none",
  {
    variants: {
      color: {
        gray: "",
        taupe:
          "group-has-[[data-title]:hover]:bg-taupe-400 group-has-[[data-title]:hover]:dark:bg-taupe-800 group-has-[[data-title]:focus-within]:bg-taupe-400 group-has-[[data-title]:focus-within]:dark:bg-taupe-800",
        blue: "group-has-[[data-title]:hover]:bg-vignettes-400 group-has-[[data-title]:hover]:dark:bg-vignettes-800 group-has-[[data-title]:focus-within]:bg-vignettes-400 group-has-[[data-title]:focus-within]:dark:bg-vignettes-800",
        emerald:
          "group-has-[[data-title]:hover]:bg-emerald-400 group-has-[[data-title]:hover]:dark:bg-emerald-800 group-has-[[data-title]:focus-within]:bg-emerald-400 group-has-[[data-title]:focus-within]:dark:bg-emerald-800",
        ember:
          "group-has-[[data-title]:hover]:bg-ember-400 group-has-[[data-title]:hover]:dark:bg-ember-800 group-has-[[data-title]:focus-within]:bg-ember-400 group-has-[[data-title]:focus-within]:dark:bg-ember-800",
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
  return (
    <span className={cn("flex w-3.5 shrink-0 justify-start", className)} {...props}>
      <span className={cn(sectionIndicatorVariants({ color }))} />
    </span>
  );
}
