import type { ComponentProps } from "react";

import { Link } from "@components/link";
import { ArrowSquareOutIcon } from "@phosphor-icons/react";
import { cn } from "cn";

export function Projects({ children, className, ...props }: ComponentProps<"div">) {
  return (
    <div
      className={cn("mx-auto flex w-full max-w-6xl flex-col gap-8 px-8 py-16", className)}
      {...props}
    >
      {children}
    </div>
  );
}

export function ProjectsHeader({ children, className, ...props }: ComponentProps<"div">) {
  return (
    <div className={cn("flex flex-col gap-2", className)} {...props}>
      {children}
    </div>
  );
}

export function ProjectsTitle({ children, className, ...props }: ComponentProps<"h2">) {
  return (
    <h2 className={cn("animate-fade-up text-lg", className)} {...props}>
      {children}
    </h2>
  );
}

export function ProjectsDescription({ children, className, ...props }: ComponentProps<"p">) {
  return (
    <p
      className={cn("animate-fade-up text-muted-foreground animation-delay-50", className)}
      {...props}
    >
      {children}
    </p>
  );
}

export function ProjectsContent({ children, className, ...props }: ComponentProps<"div">) {
  return (
    <div className={cn("flex flex-col border-t border-border", className)} {...props}>
      {children}
    </div>
  );
}

export function ProjectRow({ children, className, ...props }: ComponentProps<"article">) {
  return (
    <article
      className={cn(
        "flex flex-col gap-2 border-b border-border py-12 md:flex-row md:items-center md:gap-8",
        className,
      )}
      {...props}
    >
      {children}
    </article>
  );
}

export function ProjectRowNumber({ children, className, ...props }: ComponentProps<"span">) {
  return (
    <span className={cn("shrink-0 text-sm text-muted-foreground", className)} {...props}>
      {children}
    </span>
  );
}

export function ProjectRowTitle({
  children,
  className,
  href,
  ...props
}: ComponentProps<"h3"> & { href: string }) {
  return (
    <h3 className={cn("font-heading text-8xl font-medium md:flex-1", className)} {...props}>
      <Link
        href={href}
        className="inline-flex items-center gap-1 font-bold text-foreground hover:text-steel-400 dark:text-foreground dark:hover:text-steel-200"
      >
        {children}
        <ArrowSquareOutIcon className="size-4 shrink-0" aria-hidden="true" />
      </Link>
    </h3>
  );
}

export function ProjectRowBody({ children, className, ...props }: ComponentProps<"p">) {
  return (
    <p className={cn("text-sm text-muted-foreground", className)} {...props}>
      {children}
    </p>
  );
}

export function ProjectRowContent({ children, className, ...props }: ComponentProps<"div">) {
  return (
    <div className={cn("flex flex-col gap-3 md:w-96 md:shrink-0", className)} {...props}>
      {children}
    </div>
  );
}

export function ProjectRowTopics({ children, className, ...props }: ComponentProps<"ul">) {
  return (
    <ul className={cn("flex list-none flex-row gap-1.5", className)} {...props}>
      {children}
    </ul>
  );
}

export function ProjectRowTopic({ children, className, ...props }: ComponentProps<"li">) {
  return (
    <li
      className={cn(
        "inline-flex cursor-default items-center border border-border px-1.5 py-0.5 text-2xs tracking-wider text-muted-foreground uppercase transition-[color,border-color,transform,translate] duration-150 ease-out hover:-translate-y-0.5 hover:border-foreground hover:text-foreground motion-reduce:hover:translate-none",
        className,
      )}
      {...props}
    >
      {children}
    </li>
  );
}
