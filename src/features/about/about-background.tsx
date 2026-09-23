import { useParallax } from "@hooks/use-parallax";
import { cn } from "cn";

const layers = [
  { src: "/about-page_0003_1Asset-1.png", className: "parallax-10 dark:invert" },
  { src: "/about-page_0000_Group-2.png", className: "parallax-20 dark:invert" },
  { src: "/about-page_0001_1Asset-5.png", className: "parallax-30 dark:invert" },
  { src: "/about-page_0002_1Asset-4.png", className: "parallax-40 dark:invert" },
  { src: "/about-page_0004_Group-1.png", className: "parallax-50" },
];

export function AboutBackground() {
  const offset = useParallax();

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
      {layers.map(({ src, className }) => (
        <img
          key={src}
          src={src}
          alt=""
          className={cn("absolute -inset-5 object-contain will-change-transform", className)}
        />
      ))}
    </div>
  );
}
