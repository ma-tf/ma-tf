import { Button } from "@components/ui/button";
import { RssIcon } from "@phosphor-icons/react";

export type PreviewPost = { slug: string; title: string; publicationDate: string };

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
              <time dateTime={post.publicationDate} className="shrink-0 text-lg text-foreground">
                {post.publicationDate.split("T")[0]}
              </time>
            </a>
          </li>
        ))}
      </ul>
      <Button
        variant="inverted"
        shape="sharp"
        size="lg"
        render={
          <a href="/blog" className="mt-6 w-fit">
            View all posts
          </a>
        }
      />
    </div>
  );
}
