import type { ComponentProps } from "react";

import { cn } from "cn";

export const stillLifeScroll = {
  scrollDistance: 1.5,
  scrollDrift: 0.4,
  scrollScale: 1.15,
} as const;

export const stillLifeSectionClass =
  "text-base leading-relaxed flex flex-col gap-12 py-12 md:flex-row md:gap-9 md:pl-16";

export function StillLifeHero({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "grid min-h-dvh grid-rows-[150dvh_auto] content-start md:h-dvh md:grid-cols-10 md:grid-rows-[13fr_7fr] md:content-normal",
        className,
      )}
      {...props}
    />
  );
}

export function StillLifeHeroHeader({ className, ...props }: ComponentProps<"header">) {
  return (
    <header
      data-parallax={40}
      className={cn(
        "sticky top-0 col-start-1 row-start-1 flex h-dvh items-start justify-end px-6 pt-8 text-center md:static md:col-start-6 md:h-auto md:items-center md:justify-start md:px-0 md:pt-0",
        className,
      )}
      {...props}
    />
  );
}

export function StillLifeContent({ children, className, ...props }: ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "relative border-t bg-background px-6 pt-4 md:col-span-9 md:col-start-2 md:row-start-2 md:grid md:min-h-0 md:auto-cols-fr md:grid-flow-col md:items-start md:border-t-0 md:bg-transparent md:px-0 md:pt-0",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function StillLifeCard({ className, ...props }: ComponentProps<"div">) {
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
