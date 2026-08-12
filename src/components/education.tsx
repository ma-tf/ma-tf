import { cn } from "@lib/cn";

export function Education({ children, className, ...props }: React.ComponentProps<"div">) {
  return (
    <div className={cn("flex flex-col gap-2", className)} {...props}>
      {children}
    </div>
  );
}

export function EducationHeader({ children, className, ...props }: React.ComponentProps<"div">) {
  return (
    <div className={cn("flex flex-col gap-1", className)} {...props}>
      {children}
    </div>
  );
}

export function EducationInstitution({
  children,
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div className={cn("flex items-center gap-2 font-semibold", className)} {...props}>
      {children}
    </div>
  );
}

export function EducationLocation({ children, className, ...props }: React.ComponentProps<"div">) {
  return (
    <div className={cn("text-sm font-normal text-muted-foreground", className)} {...props}>
      {children}
    </div>
  );
}

export function EducationCourses({ children, className, ...props }: React.ComponentProps<"div">) {
  return (
    <div className={cn("flex flex-col", className)} {...props}>
      {children}
    </div>
  );
}

export function EducationCourse({ children, className, ...props }: React.ComponentProps<"div">) {
  return (
    <div className={cn("flex gap-2 text-sm", className)} {...props}>
      {children}
    </div>
  );
}

export function EducationPeriod({ children, className, ...props }: React.ComponentProps<"div">) {
  return (
    <div className={cn("text-xs text-muted-foreground", className)} {...props}>
      {children}
    </div>
  );
}

export function EducationGrade({ children, className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "inline-flex items-center rounded border bg-muted px-1.5 text-xs font-medium",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}
