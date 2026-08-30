import type { PlainPost } from "@features/blog/post-data";
import type { Tag } from "@features/tags/tag-data";

import { Orbit } from "@features/tags/orbit";
import { TagLink } from "@features/tags/tags";
import { useState } from "react";

const START_DEG = 100;
const END_DEG = 170;

type TagOrbitProps = {
  tags: Tag[];
  postsByTag: Record<string, PlainPost[]>;
};

export function TagOrbit({ tags, postsByTag }: TagOrbitProps) {
  const [selected, setSelected] = useState<Tag | null>(null);

  return (
    <Orbit
      items={tags}
      getKey={(tag) => tag.tag}
      startAngle={START_DEG}
      endAngle={END_DEG}
      stepDeg={10}
      onSelect={setSelected}
      renderItem={(tag) => (
        <TagLink
          href={`/tags/${tag.tag}`}
          onClick={(e) => {
            e.preventDefault();
            setSelected((prev) => (prev?.tag === tag.tag ? null : tag));
          }}
        >
          {tag.tag} ({tag.count})
        </TagLink>
      )}
    >
      {selected ? (
        <div className="absolute top-0 left-1/2 z-10 flex h-dvh w-sm -translate-x-1/2 flex-col items-center justify-center gap-4 bg-muted px-8 py-12">
          <span className="text-3xl font-bold">{selected.tag}</span>
          <ul className="flex w-full flex-col gap-2 overflow-y-auto">
            {(postsByTag[selected.tag] ?? []).map((post) => (
              <li key={post.slug}>
                <a
                  href={`/posts/${post.slug}`}
                  className="block text-lg font-semibold underline-offset-4 hover:underline"
                >
                  {post.title}
                </a>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <div
          aria-hidden
          className="pointer-events-none absolute top-0 left-1/2 h-dvh w-sm -translate-x-1/2 bg-muted-foreground"
        />
      )}
    </Orbit>
  );
}
