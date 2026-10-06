import { cn } from "cn";

export function Contact({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn("grid md:min-h-dvh md:grid-cols-10 md:grid-rows-[1fr_auto]", className)}
      {...props}
    />
  );
}

export function ContactHeader({ className, ...props }: React.ComponentProps<"header">) {
  return (
    <header
      data-parallax={40}
      className={cn(
        "flex items-center justify-end text-center md:col-start-6 md:justify-start",
        className,
      )}
      {...props}
    />
  );
}

export function ContactTitle({ className, ...props }: React.ComponentProps<"h1">) {
  return (
    <h1
      className={cn(
        "animate-fade-in text-7xl font-semibold uppercase animation-delay-1200 vertical-text md:text-8xl",
        className,
      )}
      {...props}
    />
  );
}

export function ContactContent({ children, className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "md:col-span-9 md:col-start-2 md:row-start-2 md:grid md:auto-cols-fr md:grid-flow-col",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function ContactCard({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div className={cn("max-w-card corner-brackets-4 corner-thickness-1", className)} {...props} />
  );
}
