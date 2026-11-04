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
    <a className={cn("font-heading text-9xl font-semibold tracking-tighter", className)} {...props}>
      {children}
    </a>
  );
}

export function HomePage() {
  return (
    <div className="relative isolate flex flex-1 flex-col" data-grid-spotlight>
      <HomeGrid />
      <nav
        aria-label="Sections"
        className="absolute top-1/2 flex -translate-y-1/2 flex-col px-16 has-[a:focus-visible]:[&>div:not(:has(a:hover,a:focus-visible))]:opacity-35 has-[a:hover]:[&>div:not(:has(a:hover,a:focus-visible))]:opacity-35"
      >
        <HomeSectionRow>
          <SectionIndicator />
          <HomeSectionNumber />
          <HomeSectionTitleLink href="/blog">Blog</HomeSectionTitleLink>
        </HomeSectionRow>

        <HomeSectionRow>
          <SectionIndicator />
          <HomeSectionNumber />
          <HomeSectionTitleLink href="/projects">Projects</HomeSectionTitleLink>
        </HomeSectionRow>

        <HomeSectionRow>
          <SectionIndicator />
          <HomeSectionNumber />
          <HomeSectionTitleLink href="/photography">Photography</HomeSectionTitleLink>
        </HomeSectionRow>

        <HomeSectionRow>
          <SectionIndicator />
          <HomeSectionNumber />
          <HomeSectionTitleLink href="/vignettes">Vignettes</HomeSectionTitleLink>
        </HomeSectionRow>

        <HomeSectionRow>
          <SectionIndicator />
          <HomeSectionNumber />
          <HomeSectionTitleLink href="/graphics">Graphics</HomeSectionTitleLink>
        </HomeSectionRow>

        <HomeSectionRow>
          <SectionIndicator color="taupe" />
          <HomeSectionNumber />
          <HomeSectionTitleLink href="/music">Music</HomeSectionTitleLink>
        </HomeSectionRow>
      </nav>
    </div>
  );
}
