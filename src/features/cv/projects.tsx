import type { ComponentProps } from "react";

import { ArrowSquareOutIcon } from "@phosphor-icons/react";
import { cn } from "cn";

export function ProjectsGrid({ children, className, ...props }: ComponentProps<"div">) {
  return (
    <div
      className={cn("grid grid-cols-1 gap-4 md:auto-rows-fr md:grid-cols-2", className)}
      {...props}
    >
      {children}
    </div>
  );
}

export function Project({ children, className, ...props }: ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "flex h-full break-inside-avoid flex-col gap-3 border border-foreground bg-card p-4",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function ProjectHeader({ children, className, ...props }: ComponentProps<"div">) {
  return (
    <div className={cn("flex flex-col gap-1", className)} {...props}>
      {children}
    </div>
  );
}

export function ProjectTitle({
  children,
  className,
  href,
  ...props
}: ComponentProps<"h3"> & { href: string }) {
  return (
    <h3 className={cn("font-heading text-base leading-snug font-medium", className)} {...props}>
      <a href={href} className="inline-flex items-center gap-1 underline-offset-4 hover:underline">
        {children}
        <ArrowSquareOutIcon className="size-3.5 shrink-0" aria-hidden="true" />
      </a>
    </h3>
  );
}

export function ProjectTopics({ children, className, ...props }: ComponentProps<"ul">) {
  return (
    <ul className={cn("flex list-none flex-wrap gap-1.5", className)} {...props}>
      {children}
    </ul>
  );
}

export function ProjectTopic({ children, className, ...props }: ComponentProps<"li">) {
  return (
    <li
      className={cn(
        "inline-flex items-center border border-border px-1.5 py-0.5 text-2xs tracking-wider text-muted-foreground uppercase",
        className,
      )}
      {...props}
    >
      {children}
    </li>
  );
}

export function ProjectContent({ children, className, ...props }: ComponentProps<"div">) {
  return (
    <div className={cn("text-sm text-muted-foreground", className)} {...props}>
      {children}
    </div>
  );
}
