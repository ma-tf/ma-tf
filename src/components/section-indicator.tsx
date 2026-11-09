import type { ComponentProps } from "react";

import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "cn";

const sectionIndicatorVariants = cva(
  "h-10 w-0.5 shrink-0 transition-[width,background-color] duration-150 motion-reduce:transition-none",
  {
    variants: {
      color: {
        gray: "bg-foreground/30 group-has-[a:hover]:w-3.5 group-has-[a:hover]:bg-foreground/30 group-has-[a:focus-visible]:w-3.5 group-has-[a:focus-visible]:bg-foreground/30",
        taupe:
          "bg-foreground/30 group-has-[a:hover]:w-3.5 group-has-[a:hover]:bg-taupe-400 group-has-[a:hover]:dark:bg-taupe-800 group-has-[a:focus-visible]:w-3.5 group-has-[a:focus-visible]:bg-taupe-400 group-has-[a:focus-visible]:dark:bg-taupe-800",
        blue: "bg-foreground/30 group-has-[a:hover]:w-3.5 group-has-[a:hover]:bg-vignettes-400 group-has-[a:hover]:dark:bg-vignettes-800 group-has-[a:focus-visible]:w-3.5 group-has-[a:focus-visible]:bg-vignettes-400 group-has-[a:focus-visible]:dark:bg-vignettes-800",
        emerald:
          "bg-foreground/30 group-has-[a:hover]:w-3.5 group-has-[a:hover]:bg-emerald-400 group-has-[a:hover]:dark:bg-emerald-800 group-has-[a:focus-visible]:w-3.5 group-has-[a:focus-visible]:bg-emerald-400 group-has-[a:focus-visible]:dark:bg-emerald-800",
        ember:
          "bg-foreground/30 group-has-[a:hover]:w-3.5 group-has-[a:hover]:bg-ember-400 group-has-[a:hover]:dark:bg-ember-800 group-has-[a:focus-visible]:w-3.5 group-has-[a:focus-visible]:bg-ember-400 group-has-[a:focus-visible]:dark:bg-ember-800",
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
