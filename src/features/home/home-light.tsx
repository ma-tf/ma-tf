import type { ComponentProps } from "react";

import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "cn";

const homeLightVariants = cva("", {
  variants: {
    color: {
      gray: "bg-steel-50 mix-blend-screen",
      taupe: "bg-taupe-400 mix-blend-color-dodge",
      blue: "bg-vignettes-400 mix-blend-color-dodge",
      emerald: "bg-emerald-400 mix-blend-color-dodge",
      ember: "bg-ember-400 mix-blend-color-dodge",
      plum: "bg-plum-400 mix-blend-color-dodge",
    },
  },
  defaultVariants: {
    color: "gray",
  },
});

type HomeLightColor = NonNullable<VariantProps<typeof homeLightVariants>["color"]>;

export function HomeLight({
  wash = "gray",
  className,
  ...props
}: ComponentProps<"span"> & { wash?: string | undefined }) {
  const color = wash as HomeLightColor;
  return (
    <span
      aria-hidden="true"
      className={cn(
        "pointer-events-none absolute top-3.5 left-3.5 -mt-px -ml-px grid size-3 place-items-center opacity-0 transition-opacity duration-150 group-focus-within/title:opacity-100 group-hover/title:opacity-100 motion-reduce:transition-none",
        className,
      )}
      {...props}
    >
      <span className={cn("size-1.5 rounded-full", homeLightVariants({ color }))} />
      <span
        aria-hidden="true"
        className={cn(
          "absolute -inset-1 rounded-full opacity-80 blur-sm",
          homeLightVariants({ color }),
        )}
      />
    </span>
  );
}
