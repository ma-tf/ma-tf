import { cn } from "@lib/cn";

export function Education({ children, className, ...props }: React.ComponentProps<"div">) {
  return (
    <div className={cn("flex flex-col bg-gray-200", className)} {...props}>
      {children}
    </div>
  );
}

export function EducationHeader({ children, className, ...props }: React.ComponentProps<"div">) {
  return (
    <div className={cn("flex flex-col bg-gray-300", className)} {...props}>
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
    <div className={cn("text-gray-500", className)} {...props}>
      {children}
    </div>
  );
}

export function EducationPeriod({ children, className, ...props }: React.ComponentProps<"div">) {
  return (
    <div className={cn("text-gray-500", className)} {...props}>
      {children}
    </div>
  );
}
