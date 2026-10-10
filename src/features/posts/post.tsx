import type { ComponentProps } from "react";

import { CalendarIcon } from "@phosphor-icons/react";
import { cn } from "cn";

export function Post({ children, className, ...props }: ComponentProps<"article">) {
  return (
    <article className={cn("mx-auto max-w-prose px-8 py-24", className)} {...props}>
      {children}
    </article>
  );
}

export function PostHeader({ children, className, ...props }: ComponentProps<"header">) {
  return (
    <header className={cn("mb-8", className)} {...props}>
      {children}
    </header>
  );
}

export function PostTitle({ children, className, ...props }: ComponentProps<"h1">) {
  return (
    <h1 className={cn("mb-2 animate-fade-up text-4xl font-bold", className)} {...props}>
      {children}
    </h1>
  );
}

export function PostDate({ className, ...props }: ComponentProps<"time">) {
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

export function PostContent({ children, className, ...props }: ComponentProps<"div">) {
  return (
    <div className={cn("post-content flex flex-col gap-5", className)} {...props}>
      {children}
    </div>
  );
}
