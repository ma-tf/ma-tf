import { ArrowDownIcon } from "@phosphor-icons/react";
import { cn } from "cn";

export function Contact({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "grid min-h-dvh grid-rows-[150dvh_auto] content-start md:grid-cols-10 md:grid-rows-[1fr_auto] md:content-normal",
        className,
      )}
      {...props}
    />
  );
}

export function ContactHeader({ className, ...props }: React.ComponentProps<"header">) {
  return (
    <header
      data-parallax={40}
      className={cn(
        "sticky top-0 col-start-1 row-start-1 flex h-dvh items-start justify-end px-6 pt-8 text-center md:static md:col-start-6 md:mt-24 md:h-auto md:items-center md:justify-start md:px-0 md:pt-0",
        className,
      )}
      {...props}
    />
  );
}

export function ContactTitle({ className, ...props }: React.ComponentProps<"h1">) {
  return (
    <h1
      data-parallax-push
      className={cn(
        "animate-fade-in title-fit font-semibold uppercase animation-delay-1200 vertical-text",
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
        "relative min-h-dvh border-t bg-background px-6 pt-4 md:col-span-9 md:col-start-2 md:row-start-2 md:grid md:min-h-0 md:auto-cols-fr md:grid-flow-col md:border-t-0 md:bg-transparent md:px-0 md:pt-0",
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
    <div
      className={cn(
        "w-full max-w-none corner-brackets-4 corner-thickness-1 md:w-auto md:max-w-card",
        className,
      )}
      {...props}
    />
  );
}

export function ContactScrollCue({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "pointer-events-none absolute right-6 bottom-6 flex animate-scroll-cue items-center gap-1 md:hidden",
        className,
      )}
      {...props}
    >
      <span className="text-2xs tracking-wider uppercase">Scroll down</span>
      <ArrowDownIcon className="size-4" aria-hidden="true" />
    </div>
  );
}
