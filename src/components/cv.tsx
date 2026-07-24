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
    <h2 className={cn("flex justify-center", className)} {...props}>
      {children}
    </h2>
  );
}
