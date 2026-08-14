import { Card, CardHeader, CardTitle, CardContent } from "@components/ui/card";
import { cn } from "@lib/cn";
import { RssIcon } from "@phosphor-icons/react";

type PreviewPost = { slug: string; title: string; pubDate: string };

export function BlogPreview({ posts }: { posts: PreviewPost[] }) {
  return (
    <Card className="w-3xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <a
            href="/blog"
            className="underline-offset-4 transition-colors hover:text-foreground/70 hover:underline"
          >
            Blog
          </a>
          <a
            href="/rss.xml"
            aria-label="RSS feed"
            className="transition-colors hover:text-foreground/70"
          >
            <RssIcon className="size-4" aria-hidden="true" />
          </a>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="flex flex-col gap-2">
          {posts.map((post) => (
            <li key={post.slug}>
              <a href={`/posts/${post.slug}`} className="group flex gap-2 hover:underline">
                <span className="font-medium transition-colors group-hover:text-foreground/70">
                  {post.title}
                </span>
                <time dateTime={post.pubDate} className="shrink-0 text-sm text-muted-foreground">
                  {post.pubDate.split("T")[0]}
                </time>
              </a>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
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
