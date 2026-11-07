import type { ComponentProps } from "react";

import {
  MobileMenu,
  MobileMenuIcon,
  MobileMenuLink,
  MobileMenuLinks,
  MobileMenuTrigger,
} from "@components/mobile-menu";
import { CalendarIcon } from "@phosphor-icons/react";
import { cn } from "cn";

export function Post({ children, className, ...props }: ComponentProps<"article">) {
  return (
    <article className={cn("mx-auto w-full max-w-prose px-8 py-24", className)} {...props}>
      {children}
    </article>
  );
}

export function PostHeader({ children, className, ...props }: ComponentProps<"header">) {
  return (
    <header className={cn("mb-8", className)} {...props}>
      {children}
    </header>
  );
}

export function PostTitle({ children, className, ...props }: ComponentProps<"h1">) {
  return (
    <h1 className={cn("mb-2 animate-fade-up text-4xl font-bold", className)} {...props}>
      {children}
    </h1>
  );
}

export function PostDate({ className, ...props }: ComponentProps<"time">) {
  return (
    <time
      className={cn("inline-flex items-center gap-1 text-muted-foreground", className)}
      {...props}
    >
      <CalendarIcon size={14} aria-hidden="true" />
      {props.children}
    </time>
  );
}

export function PostContent({ children, className, ...props }: ComponentProps<"div">) {
  return (
    <div
      className={cn("post-content relative flex flex-col gap-5 wrap-anywhere", className)}
      {...props}
    >
      {children}
    </div>
  );
}

const POST_NAVIGATION_LINKS = [
  { href: "/", label: "Home" },
  { href: "/photography", label: "Photography" },
  { href: "/vignettes", label: "Vignettes" },
  { href: "/music", label: "Music" },
] as const;

export function PostMobileNavigation({ className, ...props }: ComponentProps<"div">) {
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
          {POST_NAVIGATION_LINKS.map(({ href, label }) => (
            <MobileMenuLink key={href} href={href}>
              {label}
            </MobileMenuLink>
          ))}
        </MobileMenuLinks>
      </MobileMenu>
    </div>
  );
}
