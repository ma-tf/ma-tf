import { cn } from "@lib/cn";

export function Section({ children, className, ...props }: React.ComponentProps<"section">) {
  return (
    <section
      className={cn("grid min-h-dvh grid-cols-3 content-start gap-8 px-6 py-8", className)}
      {...props}
    >
      {children}
    </section>
  );
}

export function SectionHeader({ children, className, ...props }: React.ComponentProps<"header">) {
  return (
    <header
      className={cn("col-start-1 flex items-baseline gap-4 font-heading text-xl", className)}
      {...props}
    >
      {children}
    </header>
  );
}

export function SectionNumber({ children, className, ...props }: React.ComponentProps<"span">) {
  return (
    <span className={cn("", className)} {...props}>
      {children}
    </span>
  );
}

export function SectionTitle({ children, className, ...props }: React.ComponentProps<"a">) {
  return (
    <a
      className={cn(
        "underline-offset-4 transition-colors hover:text-foreground/70 hover:underline",
        className,
      )}
      {...props}
    >
      {children}
    </a>
  );
}

export function SectionSubtitle({ children, className, ...props }: React.ComponentProps<"h2">) {
  return (
    <p className={cn("col-start-1 text-4xl text-muted-foreground", className)} {...props}>
      {children}
    </p>
  );
}

export function SectionContent({ children, className, ...props }: React.ComponentProps<"div">) {
  return (
    <div className={cn("col-span-3 col-start-1", className)} {...props}>
      {children}
    </div>
  );
}
