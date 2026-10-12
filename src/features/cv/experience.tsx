import type { ComponentProps } from "react";

import { cn } from "cn";

export function Experience({ children, className, ...props }: ComponentProps<"div">) {
  return (
    <div className={cn("flex break-inside-avoid flex-col gap-2", className)} {...props}>
      {children}
    </div>
  );
}

export function ExperienceHeader({ children, className, ...props }: ComponentProps<"div">) {
  return (
    <div className={cn("flex flex-col gap-1", className)} {...props}>
      {children}
    </div>
  );
}

export function ExperienceCompany({ children, className, ...props }: ComponentProps<"div">) {
  return (
    <div className={cn("flex items-center gap-2 font-semibold", className)} {...props}>
      {children}
    </div>
  );
}

export function ExperiencePosition({ children, className, ...props }: ComponentProps<"div">) {
  return (
    <div className={cn("flex items-center justify-between gap-4", className)} {...props}>
      {children}
    </div>
  );
}

export function ExperienceLocation({ children, className, ...props }: ComponentProps<"div">) {
  return (
    <div className={cn("text-sm font-normal text-muted-foreground", className)} {...props}>
      {children}
    </div>
  );
}

export function ExperiencePeriod({
  start,
  finish,
  className,
}: {
  start: Date;
  finish?: Date | undefined;
  className?: string;
}) {
  return (
    <div className={cn("text-xs text-muted-foreground", className)}>
      {start.toLocaleDateString("en-GB", { month: "long", year: "numeric" })}
      {" – "}
      {finish
        ? finish.toLocaleDateString("en-GB", {
            month: "long",
            year: "numeric",
          })
        : "Present"}
    </div>
  );
}

export function ExperienceContent({ children, className, ...props }: ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "text-sm leading-relaxed text-muted-foreground [&_ul]:list-disc [&_ul]:space-y-1 [&_ul]:pl-5",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}
