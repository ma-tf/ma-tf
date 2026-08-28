import { Button } from "@components/ui/button";
import { cn } from "@lib/cn";
import { RssIcon } from "@phosphor-icons/react";

type PreviewPost = { slug: string; title: string; pubDate: string };

export function BlogPreview({ posts }: { posts: PreviewPost[] }) {
  return (
    <div className="mx-auto max-w-6xl px-8 py-24">
      <div className="flex items-center gap-2">
        <h2 className="text-lg uppercase">Latest posts</h2>
        <a
          href="/rss.xml"
          aria-label="RSS feed"
          className="transition-colors hover:text-foreground/70"
        >
          <RssIcon className="size-6" aria-hidden="true" />
        </a>
      </div>
      <ul className="flex flex-col">
        {posts.map((post) => (
          <li
            key={post.slug}
            className="py-2 transition-transform duration-150 focus-within:md:translate-x-2 hover:md:translate-x-2"
          >
            <a href={`/posts/${post.slug}`} className="group flex flex-col hover:underline">
              <span className="truncate text-xl font-semibold transition-colors group-hover:text-foreground/70 md:text-clip">
                {post.title}
              </span>
              <time dateTime={post.pubDate} className="shrink-0 text-lg text-foreground">
                {post.pubDate.split("T")[0]}
              </time>
            </a>
          </li>
        ))}
      </ul>
      <Button
        variant="outline"
        render={<a href="/blog">View all posts</a>}
        className="mt-6 w-fit rounded-none border-none bg-foreground indent-0 text-background hover:bg-muted-foreground dark:bg-foreground dark:hover:bg-muted-foreground/80"
        size="lg"
      />
    </div>
  );
}

export function Blog({ children, className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn("flex w-full flex-col gap-2 md:h-full md:flex-row md:px-8", className)}
      {...props}
    >
      {children}
    </div>
  );
}

export function BlogHeader({ children, className, ...props }: React.ComponentProps<"div">) {
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

export function BlogTitle({ children, className, ...props }: React.ComponentProps<"h1">) {
  return (
    <h1 className={cn("text-4xl md:text-8xl", className)} {...props}>
      {children}
    </h1>
  );
}

export function BlogDescription({ children, className, ...props }: React.ComponentProps<"p">) {
  return (
    <p className={cn("text-xl text-muted-foreground", className)} {...props}>
      {children}
    </p>
  );
}

export function BlogContent({ children, className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn("w-full md:h-full md:w-3/5 md:scrollbar-hidden md:overflow-y-auto", className)}
      {...props}
    >
      <div className="flex flex-col md:min-h-full md:justify-center">{children}</div>
    </div>
  );
}
