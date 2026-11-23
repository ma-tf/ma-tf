import type { AnimatedIconHandle } from "@components/icons/animated-icon";
import type { ComponentProps } from "react";

import { Rss as RssAnimated } from "@components/icons/rss";
import { NavButton } from "@components/nav-button";
import { Pill } from "@components/pill";
import { CDN_BASE } from "@lib/cdn";
import { CalendarIcon, ClockIcon, FileTextIcon, HashIcon } from "@phosphor-icons/react";
import { cn } from "cn";
import { useRef } from "react";

function PostHeader({ children, className, ...props }: ComponentProps<"header">) {
  return (
    <header className={cn("mb-8", className)} {...props}>
      {children}
    </header>
  );
}

function PostTitle({ children, className, ...props }: ComponentProps<"h1">) {
  return (
    <h1 className={cn("mb-2 animate-fade-up text-4xl font-bold", className)} {...props}>
      {children}
    </h1>
  );
}

function PostDate({ className, ...props }: ComponentProps<"time">) {
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

function PostContent({ children, className, ...props }: ComponentProps<"div">) {
  return (
    <div
      className={cn("post-content relative flex flex-col gap-5 wrap-anywhere", className)}
      {...props}
    >
      {children}
    </div>
  );
}

function PostRssLink() {
  const icon = useRef<AnimatedIconHandle>(null);

  return (
    <NavButton
      href="/rss.xml"
      variant="outline"
      arrow={false}
      aria-label="RSS feed"
      title="RSS feed"
      onMouseEnter={() => icon.current?.play()}
      onMouseLeave={() => icon.current?.stop()}
      onFocus={() => icon.current?.play()}
      onBlur={() => icon.current?.stop()}
    >
      <RssAnimated ref={icon} trigger="none" size={12} weight="bold" aria-hidden="true" />
    </NavButton>
  );
}

export function Post({
  title,
  publicationDate,
  words,
  minutesRead,
  tags,
  children,
  className,
}: ComponentProps<"article"> & {
  title: string;
  publicationDate: Date;
  words: number;
  minutesRead: string;
  tags: readonly string[];
}) {
  return (
    <article
      className={cn("relative mx-auto w-full max-w-prose px-8 py-24 pt-6 md:pt-20", className)}
    >
      <div className="mb-8 h-30 w-full overflow-hidden border border-foreground bg-muted">
        <img
          src={`${CDN_BASE}/blog/sats2-540-crop.webp`}
          alt="Two satellite dishes on a desert ridge beneath a hazy orange sky."
          width="540"
          height="127"
          fetchPriority="high"
          className="h-30 w-full object-cover"
        />
      </div>
      <PostHeader>
        <div className="mb-4 flex animate-fade-up items-center gap-1">
          <NavButton href="/blog" variant="outline">
            Blog
          </NavButton>
          <PostRssLink />
        </div>
        <PostTitle className="animation-delay-50">{title}</PostTitle>
        <div className="mb-4 flex animate-fade-up flex-wrap items-center gap-2 text-sm text-muted-foreground animation-delay-100">
          <PostDate dateTime={publicationDate.toISOString()}>
            {publicationDate.toISOString().split("T")[0]}
          </PostDate>
          <span aria-hidden="true">·</span>
          <span className="inline-flex items-center gap-1">
            <FileTextIcon size={14} aria-hidden="true" />
            {words} words
          </span>
          <span aria-hidden="true">·</span>
          <span className="inline-flex items-center gap-1">
            <ClockIcon size={14} aria-hidden="true" />
            {minutesRead}
          </span>
        </div>
        {tags.length > 0 && (
          <ul className="flex animate-fade-up flex-wrap gap-2 animation-delay-150">
            {tags.map((tag) => (
              <li key={tag}>
                <Pill href={`/blog/${tag}`}>
                  <span className="inline-flex items-center gap-0 pr-2">
                    <HashIcon size={14} className="shrink-0" />
                    {tag}
                  </span>
                </Pill>
              </li>
            ))}
          </ul>
        )}
      </PostHeader>
      <PostContent>{children}</PostContent>
      <img
        src={`${CDN_BASE}/blog/pencil-and-rubber-128.webp`}
        alt=""
        width="128"
        height="82"
        aria-hidden="true"
        className="mt-12 ml-auto w-16 dark:invert"
      />
    </article>
  );
}
