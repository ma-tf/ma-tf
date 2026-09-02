import type { Tag } from "@features/tags/tag-data";

import { Orbit } from "@features/tags/orbit";
import { OrbitProvider } from "@features/tags/orbit-context";
import { TagLink } from "@features/tags/tags";
import { useParallax } from "@hooks/use-parallax";
import { useCallback, useMemo, useRef } from "react";

const STORAGE_KEY = "ma-tf:orbit-rotation";

type TagOrbitProps = {
  tags: Tag[];
  selected: Tag | null;
};

export function TagOrbit({ tags, selected }: TagOrbitProps) {
  const rotationRef = useRef(0);
  const initialRotation = useMemo(() => Number(sessionStorage.getItem(STORAGE_KEY) ?? 0), []);
  const offset = useParallax();

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
      <Orbit
        style={{ transform: `translate(${offset.x * 0.6}px, ${offset.y * 0.6}px)` }}
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
