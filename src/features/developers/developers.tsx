import type { ComponentProps } from "react";

import { resources } from "@features/discovery/catalog";
import { cn } from "cn";

export function Developers({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "grid min-h-dvh grid-rows-[150dvh_auto] content-start text-foreground md:min-h-dvh md:grid-cols-10 md:grid-rows-none md:content-between md:gap-y-8",
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
        "sticky top-0 col-start-1 row-start-1 flex h-dvh items-start justify-end px-6 pt-8 text-center md:static md:col-span-1 md:col-start-6 md:row-start-1 md:h-auto md:flex-col md:items-end md:justify-start md:px-0 md:pt-0 md:text-start md:vertical-text",
        className,
      )}
      {...props}
    />
  );
}

export function DevelopersTitle({ className, ...props }: ComponentProps<"h1">) {
  return (
    <h1
      data-parallax-push
      className={cn(
        "animate-fade-in title-fit font-semibold uppercase animation-delay-1200 vertical-text md:text-8xl md:animation-delay-2000",
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
    <div
      className={cn(
        "relative col-start-1 row-start-2 flex flex-col gap-12 border-t bg-background px-6 py-12 md:col-span-9 md:col-start-2 md:row-start-2 md:gap-8 md:border-t-0 md:bg-transparent md:px-0 md:py-0",
        className,
      )}
      {...props}
    />
  );
}

export function DevelopersCard({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "w-full max-w-none animate-reveal corner-brackets-4 corner-thickness-1 md:w-auto md:max-w-card md:transform-none md:animate-fade-in md:opacity-100",
        className,
      )}
      {...props}
    />
  );
}

export function DevelopersResources({ className, ...props }: ComponentProps<"div">) {
  return (
    <DevelopersCard data-parallax={30} className={className} {...props}>
      <div
        data-parallax={10}
        className="relative flex flex-col px-2 pt-4 pb-2 text-base leading-relaxed md:text-xs"
      >
        <h2 className="absolute top-0 left-2 -mt-2 text-xs font-semibold uppercase md:animate-fade-up md:animation-delay-2900">
          Resources
        </h2>
        <ul className="flex flex-col gap-1.5 md:animate-fade-up md:animation-delay-3500">
          {resources.map((resource) => {
            const mediaType = resource.type.split(";")[0] ?? resource.type;

            return (
              <li key={resource.path}>
                <a
                  href={resource.path}
                  className="underline underline-offset-4 hover:text-foreground/70"
                >
                  {resource.path}
                </a>
                <span className="text-muted-foreground">
                  {" "}
                  — {mediaType} — {resource.title}
                </span>
              </li>
            );
          })}
        </ul>
      </div>
    </DevelopersCard>
  );
}
