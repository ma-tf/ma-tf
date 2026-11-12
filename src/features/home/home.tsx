import type { ComponentProps } from "react";

import { SectionIndicator } from "@components/section-indicator";
import { HomeGrid } from "@features/home/home-grid";
import { HomeLight } from "@features/home/home-light";
import { HomeWires } from "@features/home/home-wires";
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
  ...props
}: ComponentProps<"a"> & { "data-wash"?: string }) {
  return (
    <span
      className="group/title pointer-events-auto relative flex items-center focus-within:z-10 hover:z-10"
      data-title
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
            className="pointer-events-none absolute top-1/2 left-0 z-10 mt-1 -ml-5 w-49 -translate-y-1/2 md:-ml-1"
          >
            <img
              src="https://cdn.m4t.tf/misc/home-page-dec2.png"
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
          <span className="relative inline">{children}</span>
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
      className="relative isolate flex flex-1 flex-col overflow-clip wash-state has-[[data-title]:focus-within]:[&_img[data-preview-bottom]]:translate-y-45 has-[[data-title]:hover]:[&_img[data-preview-bottom]]:translate-y-45"
      data-grid-spotlight
    >
      <HomeGrid />
      <HomeWires />
      <nav
        aria-label="Sections"
        className="relative -ml-32 flex flex-col gap-y-10 px-16 py-16 perspective-midrange md:absolute md:top-1/2 md:ml-0 md:-translate-y-1/2 md:gap-y-8 md:py-0 has-[[data-title]:focus-within]:[&>div:not(:has([data-title]:hover,[data-title]:focus-within))]:opacity-35 has-[[data-title]:hover]:[&>div:not(:has([data-title]:hover,[data-title]:focus-within))]:opacity-35"
      >
        <HomeSectionRow className="-tilt-x-32 tilt-y-16">
          <HomeSectionDecorators />
          <HomeSectionTitle data-wash="emerald" href="/blog">
            Blog
          </HomeSectionTitle>
        </HomeSectionRow>

        <HomeSectionRow className="-tilt-x-20 tilt-y-16">
          <HomeSectionDecorators />
          <HomeSectionTitle data-wash="plum" href="/projects">
            Projects
          </HomeSectionTitle>
        </HomeSectionRow>

        <HomeSectionRow className="-tilt-x-10 tilt-y-16">
          <HomeSectionDecorators />
          <HomeSectionTitle data-wash="ember" href="/photography">
            Photography
          </HomeSectionTitle>
        </HomeSectionRow>

        <HomeSectionRow className="tilt-x-10 tilt-y-16">
          <HomeSectionDecorators />
          <HomeSectionTitle data-wash="blue" href="/vignettes">
            Vignettes
          </HomeSectionTitle>
        </HomeSectionRow>

        <HomeSectionRow className="tilt-x-20 tilt-y-16">
          <HomeSectionDecorators />
          <HomeSectionTitle data-wash="gray" href="/graphics">
            Graphics
          </HomeSectionTitle>
        </HomeSectionRow>

        <HomeSectionRow className="tilt-x-32 tilt-y-16">
          <HomeSectionDecorators />
          <HomeSectionTitle data-wash="taupe" href="/music">
            Music
          </HomeSectionTitle>
        </HomeSectionRow>
      </nav>
      <div className="absolute top-1/2 right-16 -translate-y-1/2 flex-col md:flex">
        <img
          src="/home-prev-top2.png"
          alt=""
          aria-hidden="true"
          loading="eager"
          decoding="async"
          width={481}
          className="hidden drop-shadow-chrome"
        />
        <img
          src="/home-prev-bottom2.png"
          alt=""
          aria-hidden="true"
          loading="eager"
          decoding="async"
          width={483}
          data-preview-bottom
          className="hidden -translate-y-5 drop-shadow-chrome transition-transform duration-150 motion-reduce:transition-none"
        />
      </div>
    </div>
  );
}
