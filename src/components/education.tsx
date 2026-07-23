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
    <div className={cn("flex flex-col", className)} {...props}>
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
    <div className={cn("text-2xl", className)} {...props}>
      {children}
    </div>
  );
}

export function EducationLocation({ children, className, ...props }: React.ComponentProps<"div">) {
  return (
    <div className={cn("text-muted-foreground", className)} {...props}>
      {children}
    </div>
  );
}

export function EducationPeriod({ children, className, ...props }: React.ComponentProps<"div">) {
  return (
    <div className={cn("text-muted-foreground", className)} {...props}>
      {children}
    </div>
  );
}
