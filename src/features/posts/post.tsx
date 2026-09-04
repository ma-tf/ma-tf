import { cn } from "@lib/cn";
import { CalendarIcon, HashIcon } from "@phosphor-icons/react";

export function Post({ children, className, ...props }: React.ComponentProps<"article">) {
  return (
    <article className={cn("mx-auto max-w-3xl px-8 py-24", className)} {...props}>
      {children}
    </article>
  );
}

export function PostHeader({ children, className, ...props }: React.ComponentProps<"header">) {
  return (
    <header className={cn("mb-8", className)} {...props}>
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
  return (
    <time
      className={cn("inline-flex items-center gap-1 text-muted-foreground", className)}
      {...props}
    >
      <CalendarIcon size={14} aria-hidden="true" />
      {props.children}
    </time>
  );
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
        "group relative inline-flex items-center overflow-hidden border border-foreground bg-background pl-1 text-xs text-foreground uppercase transition-[color,background-color] duration-150 hover:bg-foreground hover:text-background",
        className,
      )}
      {...props}
    >
      <span className="inline-flex items-center gap-0 pr-2">
        <HashIcon size={14} className="shrink-0" />
        {children}
      </span>
    </a>
  );
}

export function PostContent({ children, className, ...props }: React.ComponentProps<"div">) {
  return (
    <div className={cn("flex flex-col gap-5", className)} {...props}>
      {children}
    </div>
  );
}
