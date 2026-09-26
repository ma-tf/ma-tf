import { cn } from "cn";

export function About({ className, ...props }: React.ComponentProps<"div">) {
  return <div className={cn("grid md:h-dvh md:grid-cols-10", className)} {...props} />;
}

export function AboutHeader({ className, ...props }: React.ComponentProps<"header">) {
  return (
    <header
      data-parallax={40}
      className={cn(
        // oxlint-disable-next-line shadcn/no-arbitrary-values
        "text-center md:col-span-4 md:flex md:h-dvh md:justify-end md:pt-[calc(50dvh-12rem)]",
        className,
      )}
      {...props}
    />
  );
}

export function AboutTitle({ className, ...props }: React.ComponentProps<"h1">) {
  return (
    <h1 className={cn("animate-fade-up text-2xl font-semibold uppercase", className)} {...props} />
  );
}

export function AboutContent({ children, className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-parallax={80}
      className={cn("max-w-prose text-lg md:col-span-5 md:col-start-6", className)}
      {...props}
    >
      <div className="flex animate-fade-up flex-col gap-8 animation-delay-50">{children}</div>
    </div>
  );
}
