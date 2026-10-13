import type { ComponentProps } from "react";

import { cn } from "cn";

export function Education({ children, className, ...props }: ComponentProps<"div">) {
  return (
    <div className={cn("flex break-inside-avoid flex-col gap-2", className)} {...props}>
      {children}
    </div>
  );
}

export function EducationHeader({ children, className, ...props }: ComponentProps<"div">) {
  return (
    <div className={cn("flex flex-col gap-1", className)} {...props}>
      {children}
    </div>
  );
}

export function EducationInstitution({ children, className, ...props }: ComponentProps<"div">) {
  return (
    <div className={cn("flex items-center gap-2 font-semibold", className)} {...props}>
      {children}
    </div>
  );
}

export function EducationLocation({ children, className, ...props }: ComponentProps<"div">) {
  return (
    <div className={cn("text-sm font-normal text-muted-foreground", className)} {...props}>
      {children}
    </div>
  );
}

export function EducationDetails({ children, className, ...props }: ComponentProps<"div">) {
  return (
    <div className={cn("flex justify-between gap-4", className)} {...props}>
      {children}
    </div>
  );
}

export function EducationCourses({ children, className, ...props }: ComponentProps<"div">) {
  return (
    <div className={cn("flex flex-col", className)} {...props}>
      {children}
    </div>
  );
}

export function EducationCourse({ children, className, ...props }: ComponentProps<"div">) {
  return (
    <div className={cn("flex flex-col items-start gap-1 text-sm", className)} {...props}>
      {children}
    </div>
  );
}

export function EducationPeriod({
  start,
  finish,
  className,
}: {
  start: Date;
  finish: Date;
  className?: string;
}) {
  return (
    <div className={cn("text-xs text-muted-foreground", className)}>
      {start.toLocaleDateString("en-GB", { month: "long", year: "numeric" })}
      {" – "}
      {finish.toLocaleDateString("en-GB", { month: "long", year: "numeric" })}
    </div>
  );
}

export function EducationGrade({ children, className, ...props }: ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "inline-flex items-center border px-1.5 py-0.5 text-2xs tracking-wider text-muted-foreground uppercase",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}
