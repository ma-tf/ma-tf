import { cn } from "@lib/cn";

export function Experience({ children, className, ...props }: React.ComponentProps<"div">) {
  return (
    <div className={cn(className, "flex flex-col gap-2")} {...props}>
      {children}
    </div>
  );
}

export function ExperienceHeader({ children, className, ...props }: React.ComponentProps<"div">) {
  return (
    <div className={cn("flex flex-col gap-1", className)} {...props}>
      {children}
    </div>
  );
}

export function ExperienceCompany({ children, className, ...props }: React.ComponentProps<"div">) {
  return (
    <div className={cn("flex items-center gap-2 font-semibold", className)} {...props}>
      {children}
    </div>
  );
}

export function ExperiencePosition({ children, className, ...props }: React.ComponentProps<"div">) {
  return (
    <div className={cn("", className)} {...props}>
      {children}
    </div>
  );
}

export function ExperienceLocation({ children, className, ...props }: React.ComponentProps<"div">) {
  return (
    <div className={cn("text-sm font-normal text-muted-foreground", className)} {...props}>
      {children}
    </div>
  );
}

export function ExperiencePeriod({ children, className, ...props }: React.ComponentProps<"div">) {
  return (
    <div className={cn("text-xs text-muted-foreground", className)} {...props}>
      {children}
    </div>
  );
}

export function ExperienceContent({ children, className, ...props }: React.ComponentProps<"div">) {
  return (
    <div className={cn("text-sm text-muted-foreground", className)} {...props}>
      {children}
    </div>
  );
}
