import { cn } from "@lib/cn";

export function Blog({ children, className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn("flex w-full flex-col gap-2 md:h-full md:flex-row md:px-8", className)}
      {...props}
    >
      {children}
    </div>
  );
}

export function BlogHeader({ children, className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "flex w-full flex-col gap-4 md:w-2/5 md:justify-center md:text-right",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function BlogTitle({ children, className, ...props }: React.ComponentProps<"h1">) {
  return (
    <h1 className={cn("text-4xl md:text-8xl", className)} {...props}>
      {children}
    </h1>
  );
}

export function BlogDescription({ children, className, ...props }: React.ComponentProps<"p">) {
  return (
    <p className={cn("text-xl text-muted-foreground", className)} {...props}>
      {children}
    </p>
  );
}

export function BlogContent({ children, className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn("w-full md:h-full md:w-3/5 md:scrollbar-hidden md:overflow-y-auto", className)}
      {...props}
    >
      <div className="flex flex-col md:min-h-full md:justify-center">{children}</div>
    </div>
  );
}
