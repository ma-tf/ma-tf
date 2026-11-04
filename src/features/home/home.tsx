import type { ComponentProps } from "react";

import { SectionIndicator } from "@components/section-indicator";
import { cn } from "cn";

function HomeTitle({ children, className, ...props }: ComponentProps<"span">) {
  return (
    <span
      className={cn("font-heading text-9xl font-semibold tracking-tighter", className)}
      {...props}
    >
      {children}
    </span>
  );
}

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

function HomeSectionLink({ children, className, ...props }: ComponentProps<"a">) {
  return (
    <a
      className={cn(
        "section group flex items-center gap-8 transition-opacity duration-150 motion-reduce:transition-none",
        className,
      )}
      {...props}
    >
      {children}
    </a>
  );
}

export function HomePage() {
  return (
    <nav
      aria-label="Sections"
      className="absolute top-1/2 flex -translate-y-1/2 flex-col px-16 has-[>a:focus-visible]:[&>a:not(:hover,:focus-visible)]:opacity-35 has-[>a:hover]:[&>a:not(:hover,:focus-visible)]:opacity-35"
    >
      <HomeSectionLink href="/blog">
        <SectionIndicator />
        <HomeSectionNumber />
        <HomeTitle>Blog</HomeTitle>
      </HomeSectionLink>

      <HomeSectionLink href="/projects">
        <SectionIndicator />
        <HomeSectionNumber />
        <HomeTitle>Projects</HomeTitle>
      </HomeSectionLink>

      <HomeSectionLink href="/photography">
        <SectionIndicator />
        <HomeSectionNumber />
        <HomeTitle>Photography</HomeTitle>
      </HomeSectionLink>

      <HomeSectionLink href="/vignettes">
        <SectionIndicator />
        <HomeSectionNumber />
        <HomeTitle>Vignettes</HomeTitle>
      </HomeSectionLink>

      <HomeSectionLink href="/graphics">
        <SectionIndicator />
        <HomeSectionNumber />
        <HomeTitle>Graphics</HomeTitle>
      </HomeSectionLink>

      <HomeSectionLink href="/music">
        <SectionIndicator color="taupe" />
        <HomeSectionNumber />
        <HomeTitle>Music</HomeTitle>
      </HomeSectionLink>
    </nav>
  );
}
