import { cn } from "@lib/cn";

export function PhotographDescriptionHeader({
  children,
  className,
  ...props
}: React.ComponentProps<"h2">) {
  return (
    <h2 className={cn("text-lg", className)} {...props}>
      {children}
    </h2>
  );
}

export function PhotographDescriptionContent({
  children,
  className,
  ...props
}: React.ComponentProps<"p">) {
  return (
    <p className={cn("text-4xl prose", className)} {...props}>
      {children}
    </p>
  );
}
