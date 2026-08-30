import { cn } from "@lib/cn";

export function TagLink({ children, className, ...props }: React.ComponentProps<"a">) {
  return (
    <a
      className={cn(
        "rounded bg-secondary px-2 py-1 text-sm transition-colors hover:bg-secondary/80",
        className,
      )}
      {...props}
    >
      {children}
    </a>
  );
}
