import type { ComponentProps } from "react";

import { cn } from "cn";

export function Link({ children, className, ...props }: ComponentProps<"a">) {
  return (
    <a
      className={cn(
        "text-steel-600 no-underline transition-colors hover:text-steel-400 dark:text-steel-400 dark:hover:text-steel-200",
        className,
      )}
      {...props}
    >
      {children}
    </a>
  );
}
