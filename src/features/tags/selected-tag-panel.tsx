import type { PlainPost } from "@features/blog/post-data";
import type { Tag } from "@features/tags/tag-data";

import { useParallax } from "@hooks/use-parallax";
import { previews } from "@lib/feature-flags";
import { ArrowLeftIcon } from "@phosphor-icons/react";
import { useMemo } from "react";

type MonthGroup = {
  key: string;
  posts: PlainPost[];
};

function groupPostsByMonth(posts: PlainPost[]): MonthGroup[] {
  const map = new Map<string, PlainPost[]>();
  for (const post of posts) {
    const key = post.pubDate.slice(0, 7);
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(post);
  }
  return [...map.entries()].map(([key, groupPosts]) => ({ key, posts: groupPosts }));
}

function useGroupedByTag(postsByTag: Record<string, PlainPost[]>): Record<string, MonthGroup[]> {
  return useMemo(() => {
    const result: Record<string, MonthGroup[]> = {};
    for (const [tag, posts] of Object.entries(postsByTag)) {
      result[tag] = groupPostsByMonth(posts);
    }
    return result;
  }, [postsByTag]);
}

function TagPosts({
  selected,
  groupedByTag,
}: {
  selected: Tag;
  groupedByTag: Record<string, MonthGroup[]>;
}) {
  const groups = groupedByTag[selected.tag] ?? [];
  return (
    <div className="flex flex-col gap-4 overflow-y-auto">
      <span className="text-3xl font-bold">{selected.tag}</span>
      {groups.map(({ key, posts }) => (
        <section key={key} className="flex flex-col gap-2">
          <span className="text-xs font-medium text-muted-foreground">{`:: ${key}`}</span>
          <ul className="flex flex-col gap-2">
            {posts.map((post) => (
              <li key={post.slug} className="group relative">
                <a href={`/posts/${post.slug}`} className="block truncate text-xs font-semibold">
                  <span className="inline-block transition-transform duration-150 group-hover:translate-x-4">
                    {post.title}
                  </span>
                </a>
                <div className="pointer-events-none absolute inset-y-0 right-0 w-4 bg-linear-to-l from-background to-transparent" />
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}

function EmptyPosts() {
  return <div>No tag selected</div>;
}

type SelectedTagPanelProps = {
  selected: Tag | null;
  postsByTag: Record<string, PlainPost[]>;
};

export function SelectedTagPanel({ selected, postsByTag }: SelectedTagPanelProps) {
  const offset = useParallax();
  const groupedByTag = useGroupedByTag(postsByTag);
  const PARALLAX = 0.6;

  return (
    <div
      className="absolute top-0 left-216 z-10 grid h-dvh w-sm grid-rows-[2fr_3fr] px-8 py-12"
      style={{ transform: `translate(${offset.x * PARALLAX}px, ${offset.y * PARALLAX}px)` }}
    >
      <nav className="flex items-center justify-end">
        <div className="flex flex-col gap-1">
          {[
            { href: "/blog", label: "Blog", enabled: previews.blog },
            { href: "/music", label: "Music", enabled: previews.music },
            { href: "/photos", label: "Photography", enabled: previews.photos },
            { href: "/vignettes", label: "Vignettes", enabled: previews.vignettes },
          ]
            .filter(({ enabled }) => enabled)
            .map(({ href, label }) => (
              <a
                key={href}
                href={href}
                className="group relative inline-flex items-center overflow-hidden border border-foreground bg-foreground pr-4 pl-1 text-xs text-background uppercase transition-[color,background-color] duration-150 hover:bg-background hover:text-foreground"
              >
                <span className="inline-flex items-center gap-1 pr-2 transition-transform duration-150 group-hover:translate-x-4">
                  <ArrowLeftIcon size={14} className="-ml-5 shrink-0" />
                  {label}
                </span>
              </a>
            ))}
        </div>
      </nav>
      {selected ? <TagPosts selected={selected} groupedByTag={groupedByTag} /> : <EmptyPosts />}
    </div>
  );
}
