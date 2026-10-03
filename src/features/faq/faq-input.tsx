import type { ComponentProps } from "react";

import { Input as InputPrimitive } from "@base-ui/react/input";
import { cn } from "cn";

function FaqInput({ className, type, ...props }: ComponentProps<"input">) {
  return (
    <InputPrimitive
      type={type}
      data-slot="input"
      className={cn(
        "h-auto min-w-0 flex-1 rounded-none border-0 bg-transparent px-0 py-0 text-base shadow-none transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground/70 focus-visible:border-transparent focus-visible:ring-0 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive md:text-base dark:bg-transparent",
        className,
      )}
      {...props}
    />
  );
}

export { FaqInput };
