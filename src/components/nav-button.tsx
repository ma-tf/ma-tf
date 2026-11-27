import type { ComponentProps } from "react";

import { ArrowLeftIcon } from "@phosphor-icons/react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "cn";

const navButtonVariants = cva(
  "group relative inline-flex items-center overflow-hidden border border-foreground pr-4 pl-1 uppercase transition-colors duration-150",
  {
    variants: {
      variant: {
        solid: "bg-foreground text-background hover:bg-background hover:text-foreground",
        outline: "bg-background text-foreground hover:bg-foreground hover:text-background",
      },
      full: {
        true: "min-h-12 w-full justify-start pl-4 text-sm",
        false: "text-xs",
      },
      arrow: {
        true: "",
        false:
          "size-4.5 justify-center p-0 focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:outline-none",
      },
    },
    defaultVariants: {
      variant: "solid",
      full: false,
      arrow: true,
    },
  },
);

export function NavButton({
  children,
  className,
  variant,
  full,
  arrow = true,
  ...props
}: ComponentProps<"a"> &
  VariantProps<typeof navButtonVariants> & {
    arrow?: boolean;
  }) {
  return (
    <a
      className={cn(navButtonVariants({ variant, full, arrow, className }))}
      data-sfx={arrow && !full ? "hover" : undefined}
      {...props}
    >
      {arrow ? (
        <span
          className={cn(
            "inline-flex items-center gap-1",
            !full && "pr-2 transition-transform duration-150 group-hover:translate-x-4.5",
          )}
        >
          <ArrowLeftIcon size={14} className={cn("shrink-0", !full && "-ml-5")} />
          {children}
        </span>
      ) : (
        <span className="inline-flex items-center justify-center">{children}</span>
      )}
    </a>
  );
}
