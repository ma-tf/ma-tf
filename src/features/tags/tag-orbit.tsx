import type { PlainPost } from "@features/blog/post-data";
import type { Tag } from "@features/tags/tag-data";

import { Orbit } from "@features/tags/orbit";
import { TagLink } from "@features/tags/tags";
import { useState } from "react";

const START_DEG = 100;
const END_DEG = 170;

function SelectedOverlay({
  tag,
  posts,
  onBack,
}: {
  tag: Tag;
  posts: PlainPost[];
  onBack: () => void;
}) {
  return (
    <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center">
      <div className="pointer-events-auto max-h-[80vh] w-full max-w-2xl overflow-y-auto px-8 text-center">
        <span className="block text-5xl font-bold">{tag.tag}</span>
        <ul className="mt-6 flex flex-col gap-3">
          {posts.map((post) => (
            <li key={post.slug}>
              <a
                href={`/posts/${post.slug}`}
                className="block text-2xl font-semibold underline-offset-4 hover:underline"
              >
                {post.title}
              </a>
            </li>
          ))}
        </ul>
        <button type="button" onClick={onBack} className="mt-6 text-muted-foreground">
          ← back
        </button>
      </div>
    </div>
  );
}

type TagOrbitProps = {
  tags: Tag[];
  postsByTag: Record<string, PlainPost[]>;
};

export function TagOrbit({ tags, postsByTag }: TagOrbitProps) {
  const [selected, setSelected] = useState<Tag | null>(null);

  return (
    <>
      <Orbit
        items={tags}
        startAngle={START_DEG}
        endAngle={END_DEG}
        onSelect={setSelected}
        renderItem={(tag) => (
          <TagLink
            href={`/tags/${tag.tag}`}
            onClick={(e) => {
              e.preventDefault();
              setSelected(tag);
            }}
          >
            {tag.tag} ({tag.count})
          </TagLink>
        )}
      />
      {selected && (
        <SelectedOverlay
          tag={selected}
          posts={postsByTag[selected.tag] ?? []}
          onBack={() => setSelected(null)}
        />
      )}
    </>
  );
}
