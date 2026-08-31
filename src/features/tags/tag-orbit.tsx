import type { PlainPost } from "@features/blog/post-data";
import type { Tag } from "@features/tags/tag-data";

import { Orbit } from "@features/tags/orbit";
import { OrbitProvider } from "@features/tags/orbit-context";
import { TagOrbitContext, useTagOrbit } from "@features/tags/tag-orbit.context";
import { TagLink } from "@features/tags/tags";
import { previews } from "@lib/feature-flags";
import { ArrowLeft } from "@phosphor-icons/react";
import { useCallback, useMemo, useRef, useState } from "react";

const STORAGE_KEY = "ma-tf:orbit-rotation";

function TagPosts() {
  const { selected, postsByTag } = useTagOrbit();
  if (!selected) return null;
  return (
    <div className="flex flex-col gap-4 overflow-y-auto">
      <span className="text-3xl font-bold">{selected.tag}</span>
      <ul className="flex flex-col gap-2">
        {(postsByTag[selected.tag] ?? []).map((post) => (
          <li key={post.slug} className="group relative">
            <a href={`/posts/${post.slug}`} className="block truncate text-xs font-semibold">
              <span className="inline-block duration-150 group-hover:translate-x-4">
                {post.title}
              </span>
            </a>
            <div className="pointer-events-none absolute inset-y-0 right-0 w-4 bg-linear-to-l from-background to-transparent" />
          </li>
        ))}
      </ul>
    </div>
  );
}

function EmptyPosts() {
  return <div>No tag selected</div>;
}

function SelectedTagPanel() {
  const { selected } = useTagOrbit();
  return (
    <div className="absolute top-0 left-5/9 z-10 grid h-dvh w-sm grid-rows-[2fr_3fr] px-8 py-12">
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
                className="group relative inline-flex items-center gap-1 border border-foreground bg-foreground pr-4 pl-1 text-xs text-background uppercase transition-[color,background-color] duration-150 hover:bg-background hover:text-foreground"
              >
                <ArrowLeft
                  size={14}
                  className="opacity-0 transition-opacity duration-150 group-hover:opacity-100"
                />
                <span className="inline-block duration-150 group-hover:translate-x-4">{label}</span>
              </a>
            ))}
        </div>
      </nav>
      {selected ? <TagPosts /> : <EmptyPosts />}
    </div>
  );
}

type TagOrbitProps = {
  tags: Tag[];
  postsByTag: Record<string, PlainPost[]>;
  initialSelected: string;
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
    <OrbitProvider
      startAngle={95}
      endAngle={175}
      stepAngle={12.5}
      items={tags}
      getKey={(tag) => tag.tag}
      initialRotation={initialRotation}
    >
      <TagOrbitContext.Provider value={{ selected, postsByTag, tags, onSelect: navigate }}>
        <Orbit
          onSelect={navigate}
          onRotate={(rotation) => {
            rotationRef.current = rotation;
          }}
          renderItem={(tag: Tag) => (
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
          <SelectedTagPanel />
        </Orbit>
      </TagOrbitContext.Provider>
    </OrbitProvider>
  );
}
