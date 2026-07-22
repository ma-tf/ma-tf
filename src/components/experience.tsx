import { cn } from "@lib/cn";

export function Experience({ children, className, ...props }: React.ComponentProps<"div">) {
  return (
    <div className={cn("flex flex-col ", className)} {...props}>
      {children}
    </div>
  );
}

export function ExperienceHeader({ children, className, ...props }: React.ComponentProps<"div">) {
  return (
    <div className={cn("flex flex-col ", className)} {...props}>
      {children}
    </div>
  );
}

export function ExperienceCompany({ children, className, ...props }: React.ComponentProps<"div">) {
  return (
    <div className={cn("text-2xl", className)} {...props}>
      {children}
    </div>
  );
}

export function ExperiencePosition({ children, className, ...props }: React.ComponentProps<"div">) {
  return (
    <div className={cn("font-semibold", className)} {...props}>
      {children}
    </div>
  );
}

export function ExperienceLocation({ children, className, ...props }: React.ComponentProps<"div">) {
  return (
    <div className={cn("text-muted-foreground", className)} {...props}>
      {children}
    </div>
  );
}

export function ExperiencePeriod({ children, className, ...props }: React.ComponentProps<"div">) {
  return (
    <div className={cn("text-muted-foreground", className)} {...props}>
      {children}
    </div>
  );
}
