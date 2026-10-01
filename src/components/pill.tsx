import { cn } from "cn";

export function Pill({ children, className, ...props }: React.ComponentProps<"a">) {
  return (
    <a
      className={cn(
        "inline-flex items-center overflow-hidden border border-foreground bg-background pl-1 text-xs text-foreground uppercase no-underline! transition-colors duration-150 hover:bg-foreground! hover:text-background!",
        className,
      )}
      {...props}
    >
      {children}
    </a>
  );
}
