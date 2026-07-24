import { cn } from "@lib/cn";

export function Project({ children, className, ...props }: React.ComponentProps<"div">) {
  return (
    <div className={cn("flex flex-col gap-2", className)} {...props}>
      {children}
    </div>
  );
}

export function ProjectHeader({ children, className, ...props }: React.ComponentProps<"div">) {
  return (
    <div className={cn("flex flex-col gap-1", className)} {...props}>
      {children}
    </div>
  );
}

export function ProjectTitle({ children, className, ...props }: React.ComponentProps<"h2">) {
  return (
    <h2 className={cn("font-semibold", className)} {...props}>
      {children}
    </h2>
  );
}

export function ProjectTopics({ children, className, ...props }: React.ComponentProps<"div">) {
  return (
    <div className={cn("flex flex-wrap gap-1 text-xs", className)} {...props}>
      {children}
    </div>
  );
}

export function ProjectDescription({ children, className, ...props }: React.ComponentProps<"div">) {
  return (
    <div className={cn("text-sm text-muted-foreground", className)} {...props}>
      {children}
    </div>
  );
}
