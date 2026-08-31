import type { PlainPost } from "@features/blog/post-data";
import type { Tag } from "@features/tags/tag-data";

import { Orbit } from "@features/tags/orbit";
import { TagLink } from "@features/tags/tags";
import { previews } from "@lib/feature-flags";
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
      <div className="absolute top-0 left-1/2 z-10 grid h-dvh w-sm -translate-x-1/2 grid-rows-[2fr_3fr] px-8 py-12">
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
                  className="text-muted-foreground transition-colors hover:text-foreground"
                >
                  {label}
                </a>
              ))}
          </div>
        </nav>
        {selected ? (
          <div className="flex flex-col gap-4 overflow-y-auto">
            <span className="text-3xl font-bold">{selected.tag}</span>
            <ul className="flex flex-col gap-2">
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
          <div>No tag selected</div>
        )}
      </div>
    </Orbit>
  );
}
