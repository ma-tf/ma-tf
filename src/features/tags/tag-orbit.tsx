import type { PlainPost } from "@features/blog/post-data";
import type { Tag } from "@features/tags/tag-data";

import { Orbit } from "@features/tags/orbit";
import { TagLink } from "@features/tags/tags";
import { useCallback, useMemo, useRef, useState } from "react";

const STORAGE_KEY = "ma-tf:orbit-rotation";

type TagOrbitProps = {
  tags: Tag[];
  postsByTag: Record<string, PlainPost[]>;
  initialSelected?: string;
};

export function TagOrbit({ tags, postsByTag, initialSelected }: TagOrbitProps) {
  const [selected] = useState<Tag | null>(() =>
    initialSelected ? (tags.find((t) => t.tag === initialSelected) ?? null) : null,
  );
  const rotationRef = useRef(0);
  const initialRotation = useMemo(() => Number(sessionStorage.getItem(STORAGE_KEY) ?? 0), []);

  const navigate = useCallback(
    (tag: Tag | null) => {
      if (!tag) return;
      sessionStorage.setItem(STORAGE_KEY, String(rotationRef.current));
      window.location.href = selected?.tag === tag.tag ? "/tags" : `/tags/${tag.tag}`;
    },
    [selected],
  );

  return (
    <Orbit
      items={tags}
      getKey={(tag) => tag.tag}
      startAngle={95}
      endAngle={175}
      stepDeg={12.5}
      onSelect={navigate}
      onRotate={(rotation) => {
        rotationRef.current = rotation;
      }}
      initialRotation={initialRotation}
      renderItem={(tag) => (
        <TagLink
          href={selected?.tag === tag.tag ? "/tags" : `/tags/${tag.tag}`}
          onClick={(e) => {
            e.preventDefault();
            navigate(tag);
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
