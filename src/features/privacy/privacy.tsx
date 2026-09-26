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
      className={cn("text-center md:col-span-4 md:flex md:items-center md:justify-end", className)}
      {...props}
    />
  );
}

export function PrivacyTitle({ className, ...props }: React.ComponentProps<"h1">) {
  return (
    <h1 className={cn("animate-fade-up text-2xl font-semibold uppercase", className)} {...props} />
  );
}

export function PrivacyContent({ children, className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-parallax={80}
      className={cn(
        "flex max-w-prose flex-col gap-8 text-sm md:col-span-9 md:col-start-2 md:row-start-2 md:grid md:max-w-none md:auto-cols-fr md:grid-flow-col md:pr-8",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}
