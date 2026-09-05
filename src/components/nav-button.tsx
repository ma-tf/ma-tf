import type { ComponentProps } from "react";

import { cn } from "@lib/cn";
import { ArrowLeftIcon } from "@phosphor-icons/react";
import { cva, type VariantProps } from "class-variance-authority";

const navButtonVariants = cva(
  "group relative inline-flex items-center overflow-hidden border border-foreground pr-4 pl-1 text-xs uppercase transition-[color,background-color] duration-150",
  {
    variants: {
      variant: {
        solid: "bg-foreground text-background hover:bg-background hover:text-foreground",
        outline: "bg-background text-foreground hover:bg-foreground hover:text-background",
      },
    },
    defaultVariants: {
      variant: "solid",
    },
  },
);

export function NavButton({
  children,
  className,
  variant,
  ...props
}: ComponentProps<"a"> & VariantProps<typeof navButtonVariants>) {
  return (
    <a className={cn(navButtonVariants({ variant, className }))} {...props}>
      <span className="inline-flex items-center gap-1 pr-2 transition-transform duration-150 group-hover:translate-x-4">
        <ArrowLeftIcon size={14} className="-ml-5 shrink-0" />
        {children}
      </span>
    </a>
  );
}
