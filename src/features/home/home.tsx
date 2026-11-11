import type { ComponentProps } from "react";

import { SectionIndicator } from "@components/section-indicator";
import { HomeGrid } from "@features/home/home-grid";
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
        "section group flex items-center gap-8 transition-opacity duration-150 motion-reduce:transition-none",
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
    <a className={cn("font-heading text-8xl font-semibold tracking-tighter", className)} {...props}>
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
      className="group/title relative flex items-center focus-within:z-10 hover:z-10"
      data-title
      data-wash={dataWash}
    >
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -top-1 -right-5 -bottom-3 left-5 bg-muted/50 transition-transform duration-150 group-hover/title:translate-x-20 motion-reduce:transition-none"
      />
      <span className="flex items-center transition-transform duration-150 group-hover/title:translate-x-20 motion-reduce:transition-none">
        <img
          src="https://cdn.m4t.tf/misc/home-page-dec2.png"
          alt=""
          aria-hidden="true"
          loading="eager"
          decoding="async"
          width={196}
          height={156}
          className="pointer-events-none absolute top-1/2 left-0 mt-1 -ml-1 shrink-0 -translate-y-1/2 mask-b-from-33% mask-b-to-66% p-2 brightness-75 contrast-125 drop-shadow-chrome group-hover/title:mask-none"
        />
        <HomeSectionTitleLink className={cn("relative pl-12", className)} {...props}>
          {children}
        </HomeSectionTitleLink>
      </span>
    </span>
  );
}

export function HomePage() {
  return (
    <div className="relative isolate flex flex-1 flex-col wash-state" data-grid-spotlight>
      <HomeGrid />
      <nav
        aria-label="Sections"
        className="absolute top-1/2 flex -translate-y-1/2 flex-col gap-y-5 px-16 has-[[data-title]:focus-within]:[&>div:not(:has([data-title]:hover,[data-title]:focus-within))]:opacity-35 has-[[data-title]:hover]:[&>div:not(:has([data-title]:hover,[data-title]:focus-within))]:opacity-35"
      >
        <HomeSectionRow>
          <SectionIndicator color="emerald" />
          <HomeSectionNumber />
          <HomeSectionTitle data-wash="emerald" href="/blog">
            Blog
          </HomeSectionTitle>
        </HomeSectionRow>

        <HomeSectionRow>
          <SectionIndicator />
          <HomeSectionNumber />
          <HomeSectionTitle data-wash="gray" href="/projects">
            Projects
          </HomeSectionTitle>
        </HomeSectionRow>

        <HomeSectionRow>
          <SectionIndicator color="ember" />
          <HomeSectionNumber />
          <HomeSectionTitle data-wash="ember" href="/photography">
            Photography
          </HomeSectionTitle>
        </HomeSectionRow>

        <HomeSectionRow>
          <SectionIndicator color="blue" />
          <HomeSectionNumber />
          <HomeSectionTitle data-wash="blue" href="/vignettes">
            Vignettes
          </HomeSectionTitle>
        </HomeSectionRow>

        <HomeSectionRow>
          <SectionIndicator />
          <HomeSectionNumber />
          <HomeSectionTitle data-wash="gray" href="/graphics">
            Graphics
          </HomeSectionTitle>
        </HomeSectionRow>

        <HomeSectionRow>
          <SectionIndicator color="taupe" />
          <HomeSectionNumber />
          <HomeSectionTitle data-wash="taupe" href="/music">
            Music
          </HomeSectionTitle>
        </HomeSectionRow>
      </nav>
    </div>
  );
}
