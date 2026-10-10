import type { ComponentProps } from "react";

import { cn } from "cn";

export function Developers({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "grid text-foreground md:min-h-dvh md:grid-cols-10 md:content-between md:gap-y-8",
        className,
      )}
      {...props}
    />
  );
}

export function DevelopersHeader({ className, ...props }: ComponentProps<"header">) {
  return (
    <header
      className={cn(
        "md:col-span-1 md:col-start-6 md:row-start-1 md:flex md:flex-col md:items-end md:vertical-text",
        className,
      )}
      {...props}
    />
  );
}

export function DevelopersTitle({ className, ...props }: ComponentProps<"h1">) {
  return (
    <h1
      data-parallax={30}
      className={cn(
        "animate-fade-in text-8xl font-semibold uppercase animation-delay-2000",
        className,
      )}
      {...props}
    />
  );
}

export function DevelopersIntro({ className, ...props }: ComponentProps<"p">) {
  return (
    <p
      data-parallax={60}
      className={cn(
        "max-h-prose animate-fade-in text-right text-xs leading-relaxed animation-delay-2150",
        className,
      )}
      {...props}
    />
  );
}

export function DevelopersContent({ className, ...props }: ComponentProps<"div">) {
  return (
    <div className={cn("md:col-span-9 md:col-start-2 md:row-start-2", className)} {...props} />
  );
}

export function DevelopersCard({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      className={cn("max-w-card animate-fade-in corner-brackets-4 corner-thickness-1", className)}
      {...props}
    />
  );
}
