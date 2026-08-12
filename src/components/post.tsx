import { cn } from "@lib/cn";

export function Post({ children, className, ...props }: React.ComponentProps<"article">) {
  return (
    <article
      className={cn("prose dark:prose-invert mx-auto max-w-3xl px-8 py-12", className)}
      {...props}
    >
      {children}
    </article>
  );
}

export function PostBackLink({ children, className, ...props }: React.ComponentProps<"a">) {
  return (
    <a
      className={cn(
        "not-prose text-muted-foreground underline underline-offset-4 transition-colors hover:text-foreground",
        className,
      )}
      {...props}
    >
      {children}
    </a>
  );
}

export function PostHeader({ children, className, ...props }: React.ComponentProps<"header">) {
  return (
    <header className={cn("not-prose mb-8", className)} {...props}>
      {children}
    </header>
  );
}

export function PostTitle({ children, className, ...props }: React.ComponentProps<"h1">) {
  return (
    <h1 className={cn("mb-2 text-4xl font-bold", className)} {...props}>
      {children}
    </h1>
  );
}

export function PostDate({ className, ...props }: React.ComponentProps<"time">) {
  return <time className={cn("mb-4 block text-muted-foreground", className)} {...props} />;
}

export function PostTags({ children, className, ...props }: React.ComponentProps<"ul">) {
  return (
    <ul className={cn("flex flex-wrap gap-2", className)} {...props}>
      {children}
    </ul>
  );
}

export function PostTag({ children, className, ...props }: React.ComponentProps<"a">) {
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

export function PostContent({ children, className, ...props }: React.ComponentProps<"div">) {
  return (
    <div className={cn("not-prose", className)} {...props}>
      {children}
    </div>
  );
}
