import type { ComponentProps } from "react";

import { SectionIndicator } from "@components/section-indicator";
import { HomeFragments } from "@features/home/home-fragments";
import { HomeGrid } from "@features/home/home-grid";
import { HomeLight } from "@features/home/home-light";
import { HomePrev } from "@features/home/home-prev";
import { HomeWires } from "@features/home/home-wires";
import { CDN_BASE } from "@lib/cdn";
import { cn } from "cn";

function HomeSectionNumber({ className, ...props }: ComponentProps<"span">) {
  return (
    <span
      className={cn(
        "section-number font-mono text-2xs tracking-widest text-muted-foreground",
        className,
      )}
      {...props}
    />
  );
}

function HomeSectionRow({ children, className, ...props }: ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "section group pointer-events-none flex items-center gap-8 transition-opacity duration-150 focus-within:z-10 hover:z-10 motion-reduce:transition-none",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

function HomeSectionTitleLink({ children, className, ...props }: ComponentProps<"a">) {
  return (
    <a
      className={cn("font-heading text-6xl font-semibold tracking-tighter md:text-8xl", className)}
      {...props}
    >
      {children}
    </a>
  );
}

function HomeSectionTitle({
  children,
  className,
  "data-wash": dataWash,
  flickerClassName,
  ...props
}: ComponentProps<"a"> & { "data-wash"?: string; flickerClassName?: string }) {
  return (
    <span
      className="group/title pointer-events-auto relative flex items-center focus-within:z-10 hover:z-10"
      data-title
      data-fragments-avoid
      data-parallax={10}
      data-wash={dataWash}
    >
      <span
        aria-hidden="true"
        className="pointer-events-none absolute top-1/2 left-0 mt-1 -ml-11 h-42 w-59 -translate-y-1/2"
      />
      <span className="flex items-center transition-transform duration-150 group-hover/title:translate-x-20 motion-reduce:transition-none">
        <HomeSectionTitleLink className={cn("relative pl-4 md:pl-12", className)} {...props}>
          <span
            aria-hidden="true"
            data-fragments-avoid
            className="pointer-events-none absolute top-1/2 left-0 z-10 mt-1 -ml-5 w-49 -translate-y-1/2 md:-ml-1"
          >
            <img
              src={`${CDN_BASE}/misc/home-page-dec2.png`}
              alt=""
              aria-hidden="true"
              loading="eager"
              decoding="async"
              width={196}
              height={156}
              className="block w-49 mask-b-from-33% mask-b-to-66% p-2 brightness-75 contrast-125 drop-shadow-chrome group-hover/title:mask-none"
            />
            <HomeLight wash={dataWash} />
            <span
              aria-hidden="true"
              data-wire-landing
              className="absolute top-4.5 left-4.5 h-0 w-0"
            />
            <span
              aria-hidden="true"
              data-wire-landing
              className="absolute top-4.5 left-7 h-0 w-0"
            />
          </span>
          <span
            aria-hidden="true"
            className="absolute top-1/2 -right-5 left-1 -mt-1.5 h-22 -translate-y-1/2 bg-muted/50 md:left-4.5 md:mt-1 md:h-28"
          />
          <span className={cn("relative inline animate-fade-in", flickerClassName)}>
            {children}
          </span>
        </HomeSectionTitleLink>
      </span>
    </span>
  );
}

function HomeSectionDecorators() {
  return (
    <>
      <SectionIndicator className="invisible" />
      <HomeSectionNumber className="invisible" />
    </>
  );
}

export function HomePage() {
  return (
    <div
      className="relative isolate wash-state flex flex-1 flex-col overflow-clip perspective-midrange"
      data-grid-spotlight
    >
      <HomeGrid />
      <HomeWires />
      <HomeFragments />
      <nav
        aria-label="Sections"
        className="relative mt-9 -ml-28 flex w-3xl shrink-0 flex-col gap-y-10 px-16 py-16 perspective-distant sm:-ml-14 md:absolute md:top-1/2 md:mt-0 md:ml-0 md:w-auto md:-translate-y-1/2 md:gap-y-8 md:py-0 md:perspective-midrange has-[[data-title]:focus-within]:[&>div:not(:has([data-title]:hover,[data-title]:focus-within))]:opacity-35 has-[[data-title]:hover]:[&>div:not(:has([data-title]:hover,[data-title]:focus-within))]:opacity-35"
      >
        <HomeSectionRow className="-tilt-x-19 tilt-z-53">
          <HomeSectionDecorators />
          <HomeSectionTitle flickerClassName="animation-delay-400" data-wash="emerald" href="/blog">
            Blog
          </HomeSectionTitle>
        </HomeSectionRow>

        <HomeSectionRow className="-translate-x-2 -tilt-x-11 tilt-z-19 md:translate-x-0">
          <HomeSectionDecorators />
          <HomeSectionTitle
            flickerClassName="animation-delay-550"
            data-wash="plum"
            href="/projects"
          >
            Projects
          </HomeSectionTitle>
        </HomeSectionRow>

        <HomeSectionRow className="-translate-x-3 -tilt-x-4 tilt-z-2 md:translate-x-0">
          <HomeSectionDecorators />
          <HomeSectionTitle
            flickerClassName="animation-delay-700"
            data-wash="ember"
            href="/photography"
          >
            Photography
          </HomeSectionTitle>
        </HomeSectionRow>

        <HomeSectionRow className="-translate-x-3 tilt-x-4 tilt-z-2 md:translate-x-0">
          <HomeSectionDecorators />
          <HomeSectionTitle
            flickerClassName="animation-delay-850"
            data-wash="blue"
            href="/vignettes"
          >
            Vignettes
          </HomeSectionTitle>
        </HomeSectionRow>

        <HomeSectionRow className="-translate-x-2 tilt-x-11 tilt-z-19 md:translate-x-0">
          <HomeSectionDecorators />
          <HomeSectionTitle
            flickerClassName="animation-delay-1000"
            data-wash="gray"
            href="/graphics"
          >
            Graphics
          </HomeSectionTitle>
        </HomeSectionRow>

        <HomeSectionRow className="tilt-x-19 tilt-z-53">
          <HomeSectionDecorators />
          <HomeSectionTitle flickerClassName="animation-delay-1150" data-wash="taupe" href="/music">
            Music
          </HomeSectionTitle>
        </HomeSectionRow>
      </nav>
      <HomePrev />
    </div>
  );
}
