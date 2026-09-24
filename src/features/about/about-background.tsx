import { useParallax } from "@hooks/use-parallax";
import { cn } from "cn";

const base = `${import.meta.env.R2_PUBLIC_URL}/about`;

const layers = [
  { path: "about-bg-hexagons.webp", className: "parallax-10 dark:invert" },
  { path: "about-bg-chevrons.webp", className: "parallax-15 dark:invert" },
  { path: "about-bg-table-pedestal.webp", className: "parallax-30" },
  { path: "about-bg-table-top.webp", className: "parallax-30" },
  { path: "about-bg-zigzag.webp", className: "parallax-20 dark:invert" },
  { path: "about-bg-arrows.webp", className: "parallax-35 dark:invert" },
];

export function AboutBackground({ baseUrl }: { baseUrl?: string }) {
  const offset = useParallax();
  const url = (path: string) => `${baseUrl ?? base}/${path}`;

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute top-0 left-0 -z-10 aspect-4/3 h-dvh"
      style={
        {
          "--parallax-x": `${offset.x}px`,
          "--parallax-y": `${offset.y}px`,
        } as React.CSSProperties
      }
    >
      {layers.map(({ path, className }) => (
        <img
          key={path}
          src={url(path)}
          alt=""
          className={cn("absolute -inset-5 object-contain will-change-transform", className)}
        />
      ))}
    </div>
  );
}
