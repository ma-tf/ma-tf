import { cn } from "@lib/cn";

export function CurriculumVitaeSection({
  children,
  className,
  ...props
}: React.ComponentProps<"section">) {
  return (
    <section className={cn("flex flex-col gap-4", className)} {...props}>
      {children}
    </section>
  );
}

export function CurriculumVitaeTitle({
  children,
  className,
  ...props
}: React.ComponentProps<"h2">) {
  return (
    <h2 className={cn("flex justify-center uppercase", className)} {...props}>
      {children}
    </h2>
  );
}

export function CurriculumVitaeName({ children, className, ...props }: React.ComponentProps<"h1">) {
  return (
    <h1 className={cn("text-2xl font-bold", className)} {...props}>
      {children}
    </h1>
  );
}

export function CurriculumVitaeRole({ children, className, ...props }: React.ComponentProps<"h2">) {
  return (
    <h2 className={cn("text-lg text-muted-foreground", className)} {...props}>
      {children}
    </h2>
  );
}
