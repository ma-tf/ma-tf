import { cn } from "cn";

export function Privacy({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn("grid md:h-dvh md:grid-cols-10 md:grid-rows-[1fr_auto]", className)}
      {...props}
    />
  );
}

export function PrivacyHeader({ className, ...props }: React.ComponentProps<"header">) {
  return (
    <header
      data-parallax={40}
      className={cn("text-center md:col-start-5 md:flex md:items-center", className)}
      {...props}
    />
  );
}

export function PrivacyTitle({ className, ...props }: React.ComponentProps<"h1">) {
  return (
    <h1
      className={cn(
        "rotate-90 animate-fade-in text-9xl font-semibold uppercase animation-delay-1200",
        className,
      )}
      {...props}
    />
  );
}

export function PrivacyContent({ children, className, ...props }: React.ComponentProps<"div">) {
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
