import type { Tag } from "@features/tags/tag-data";

import { Orbit } from "@features/tags/orbit";
import { OrbitProvider } from "@features/tags/orbit-context";
import { readStoredRotation, writeStoredRotation } from "@features/tags/orbit-storage";
import { TagLink } from "@features/tags/tags";
import { useCallback, useMemo, useRef } from "react";

type TagOrbitProps = {
  tags: Tag[];
  selected: Tag | null;
};

export function TagOrbit({ tags, selected }: TagOrbitProps) {
  const rotationRef = useRef(0);
  const initialRotation = useMemo(() => readStoredRotation(), []);

  const navigate = useCallback(
    (tag: Tag | null) => {
      if (!tag) return;
      writeStoredRotation(rotationRef.current);
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
      <Orbit
        data-parallax={60}
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
      />
    </OrbitProvider>
  );
}
