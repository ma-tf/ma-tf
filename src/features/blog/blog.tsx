import type { PlainPost } from "@features/blog/post-data";
import type { ComponentProps, CSSProperties, ReactNode } from "react";

import {
  MobileMenu,
  MobileMenuIcon,
  MobileMenuLink,
  MobileMenuLinks,
  MobileMenuTrigger,
} from "@components/mobile-menu";
import { NavButton } from "@components/nav-button";
import { CaretRightIcon } from "@phosphor-icons/react";
import { cn } from "cn";

const BLOG_NAVIGATION_LINKS = [
  { href: "/", label: "Home" },
  { href: "/photography", label: "Photography" },
  { href: "/vignettes", label: "Vignettes" },
  { href: "/music", label: "Music" },
] as const;

export function BlogPage({ children }: { children: ReactNode }) {
  return (
    <div
      data-blog-scroll
      className="relative isolate flex min-h-dvh px-6 md:h-dvh md:overflow-hidden md:px-4"
    >
      {children}
    </div>
  );
}

export function BlogBackgrounds({ baseUrl }: { baseUrl: string }) {
  return (
    <div
      aria-hidden="true"
      data-parallax-scroll
      data-parallax-scroll-distance={1.5}
      data-parallax-scroll-drift={0.4}
      data-parallax-scroll-scale={1.15}
      className="contents"
    >
      <div
        data-parallax={15}
        className="fixed inset-0 -z-10 bg-(image:--background-image) bg-cover bg-left opacity-50 md:absolute md:-inset-2 md:bg-left md:opacity-100 dark:invert"
        style={
          { "--background-image": `url("${baseUrl}/blog/blog-bg-back.webp")` } as CSSProperties
        }
      />
      <div
        data-parallax={30}
        className="fixed inset-0 -z-10 bg-(image:--background-image) bg-cover bg-bottom-left opacity-30 md:absolute md:-inset-4 md:bg-left md:opacity-100 dark:invert"
        style={
          { "--background-image": `url("${baseUrl}/blog/blog-bg-front.webp")` } as CSSProperties
        }
      />
    </div>
  );
}

export function Blog({ children, className, ...props }: ComponentProps<"div">) {
  return (
    <div
      className={cn("flex w-full flex-col gap-8 md:h-full md:flex-row md:px-8", className)}
      {...props}
    >
      {children}
    </div>
  );
}

export function BlogHeader({ children, className, ...props }: ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "flex w-full flex-col gap-4 md:w-2/5 md:justify-center md:text-right",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function BlogTitle({ children, className, ...props }: ComponentProps<"h1">) {
  return (
    <h1 className={cn("text-4xl md:text-8xl", className)} {...props}>
      {children}
    </h1>
  );
}

export function BlogDescription({ children, className, ...props }: ComponentProps<"p">) {
  return (
    <p className={cn("text-xl text-muted-foreground", className)} {...props}>
      {children}
    </p>
  );
}

export function BlogContent({ children, className, ...props }: ComponentProps<"div">) {
  return (
    <div
      data-blog-scroll-target
      role="region"
      aria-label="Posts"
      tabIndex={0}
      className={cn("w-full md:h-full md:w-3/5 md:scrollbar-hidden md:overflow-y-auto", className)}
      {...props}
    >
      <div className="flex flex-col md:min-h-full md:justify-center md:pl-6">{children}</div>
    </div>
  );
}

export function BlogNavigation({ className, ...props }: ComponentProps<"nav">) {
  return (
    <nav
      className={cn("mt-4 hidden flex-wrap justify-end gap-1 md:flex", className)}
      aria-label="Section navigation"
      {...props}
    >
      {BLOG_NAVIGATION_LINKS.map(({ href, label }) => (
        <NavButton key={href} href={href}>
          {label}
        </NavButton>
      ))}
    </nav>
  );
}

export function BlogMobileNavigation({ className, ...props }: ComponentProps<"div">) {
  return (
    <div className={cn("-mx-6 mt-12 md:hidden", className)} {...props}>
      <MobileMenu>
        <div className="flex justify-end px-6">
          <MobileMenuTrigger>
            <span className="inline-flex min-h-10 items-center gap-2 border border-foreground bg-foreground px-3 text-sm text-background uppercase transition-colors duration-150 hover:bg-background hover:text-foreground">
              menu
              <MobileMenuIcon />
            </span>
          </MobileMenuTrigger>
        </div>
        <MobileMenuLinks>
          {BLOG_NAVIGATION_LINKS.map(({ href, label }) => (
            <MobileMenuLink key={href} href={href}>
              {label}
            </MobileMenuLink>
          ))}
        </MobileMenuLinks>
      </MobileMenu>
    </div>
  );
}

export function BlogPostList({
  posts,
  className,
  ...props
}: { posts: PlainPost[] } & ComponentProps<"ul">) {
  return (
    <ul className={cn("flex flex-col pb-12", className)} {...props}>
      {posts.map((post, index) => (
        <li
          key={post.slug}
          className="group my-2 animate-fade-up md:my-0 md:py-2"
          style={{ "--delay": `${150 + index * 50}ms` } as CSSProperties}
        >
          <a
            href={`/posts/${post.slug}`}
            className="flex w-full flex-col pl-6 text-left text-base transition-transform duration-150 outline-none group-focus-within:md:translate-x-3 group-hover:md:translate-x-3 focus-within:md:translate-x-3"
          >
            <div className="relative flex items-center">
              <CaretRightIcon
                size={14}
                weight="bold"
                aria-hidden="true"
                className="absolute top-1/2 -left-1 -translate-x-full -translate-y-1/2"
              />
              <span className="min-w-0 truncate font-semibold uppercase">{post.title}</span>
            </div>
            <div className="flex flex-col">
              <time className="shrink-0 text-sm font-bold" dateTime={post.publicationDate}>
                {post.publicationDate.split("T")[0]}
              </time>
            </div>
            <p className="text-sm">{post.description}</p>
          </a>
        </li>
      ))}
    </ul>
  );
}
