import { cn } from "@lib/cn";

export function Tags({ children, className, ...props }: React.ComponentProps<"main">) {
  return (
    <main
      className={cn("mx-auto flex w-full max-w-3xl flex-col gap-6 px-8 py-12", className)}
      {...props}
    >
      {children}
    </main>
  );
}

export function TagsTitle({ children, className, ...props }: React.ComponentProps<"h1">) {
  return (
    <h1 className={cn("text-4xl font-bold", className)} {...props}>
      {children}
    </h1>
  );
}

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

export function TagsBackLink({ children, className, ...props }: React.ComponentProps<"a">) {
  return (
    <a
      className={cn(
        "text-muted-foreground underline underline-offset-4 transition-colors hover:text-foreground",
        className,
      )}
      {...props}
    >
      {children}
    </a>
  );
}
