import type { ComponentProps } from "react";

import { Link } from "@components/link";
import { cn } from "cn";

export function CurriculumVitaeSection({
  children,
  className,
  ...props
}: ComponentProps<"section">) {
  return (
    <section className={cn("flex flex-col gap-4 py-4", className)} {...props}>
      {children}
    </section>
  );
}

export function CurriculumVitaeTitle({ children, className, ...props }: ComponentProps<"h2">) {
  return (
    <h2
      className={cn(
        "flex break-after-avoid items-center gap-4 text-xs font-semibold tracking-widest text-muted-foreground uppercase",
        className,
      )}
      {...props}
    >
      <span aria-hidden="true" className="h-px flex-1 bg-border" />
      <span className="text-steel-400">
        # <span className="text-muted-foreground">{children}</span>
      </span>
      <span aria-hidden="true" className="h-px flex-1 bg-border" />
    </h2>
  );
}

export function CurriculumVitaeName({ children, className, ...props }: ComponentProps<"h1">) {
  return (
    <h1 className={cn("text-3xl font-semibold tracking-tight", className)} {...props}>
      {children}
    </h1>
  );
}

export function CurriculumVitaeRole({ children, className, ...props }: ComponentProps<"h2">) {
  return (
    <h2 className={cn("text-lg text-muted-foreground", className)} {...props}>
      {children}
    </h2>
  );
}

export function CurriculumVitaeContact({ children, className, ...props }: ComponentProps<"div">) {
  return (
    <div className={cn("flex gap-4 text-sm text-muted-foreground", className)} {...props}>
      {children}
    </div>
  );
}

export function CurriculumVitaeContactLink({ children, className, ...props }: ComponentProps<"a">) {
  return (
    <Link className={cn("inline-flex items-center gap-1", className)} {...props}>
      {children}
    </Link>
  );
}

export function CurriculumVitaeStrengths({ children, className, ...props }: ComponentProps<"div">) {
  return (
    <div className={cn("flex flex-col gap-3", className)} {...props}>
      {children}
    </div>
  );
}

export function CurriculumVitaeStrength({ children, className, ...props }: ComponentProps<"ul">) {
  return (
    <ul className={cn("flex flex-wrap gap-2", className)} {...props}>
      {children}
    </ul>
  );
}

export function CurriculumVitaeSkill({ children, className, ...props }: ComponentProps<"li">) {
  return (
    <li
      className={cn(
        "cursor-default border border-border px-1.5 py-0.5 text-2xs tracking-wider text-muted-foreground uppercase transition-colors duration-150 hover:border-foreground hover:bg-muted hover:text-foreground",
        className,
      )}
      {...props}
    >
      {children}
    </li>
  );
}
