import type { ComponentProps } from "react";

import { cn } from "cn";

export function ErrorPage({ children, className, ...props }: ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "mx-auto -mb-8 flex min-h-dvh w-full max-w-3xl flex-1 flex-col justify-center border-l px-6 py-8 md:mb-0 md:px-16 md:pb-20",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function ErrorPageContent({ className, ...props }: ComponentProps<"div">) {
  return <div className={cn("flex flex-col gap-2", className)} {...props} />;
}

export function ErrorPageHeader({ className, ...props }: ComponentProps<"header">) {
  return <header className={cn("mb-4 flex flex-col gap-3", className)} {...props} />;
}

export function ErrorPageEyebrow({ className, ...props }: ComponentProps<"p">) {
  return (
    <p
      className={cn(
        "font-mono text-2xs font-semibold tracking-widest text-muted-foreground uppercase",
        className,
      )}
      {...props}
    />
  );
}

export function ErrorPageTitle({ className, ...props }: ComponentProps<"h1">) {
  return <h1 className={cn("title-fit font-semibold uppercase", className)} {...props} />;
}

export function ErrorPageDescription({ className, ...props }: ComponentProps<"p">) {
  return (
    <p
      className={cn("mb-4 max-w-prose text-lg leading-relaxed text-muted-foreground", className)}
      {...props}
    />
  );
}
