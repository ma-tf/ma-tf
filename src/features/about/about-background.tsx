import { useParallax } from "@hooks/use-parallax";

const shared = "absolute -inset-5 object-contain will-change-transform";

export function AboutBackground({ baseUrl }: { baseUrl: string }) {
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
      <img
        src={`${baseUrl}/about-bg-hexagons.webp`}
        alt=""
        className={`${shared} parallax-10 dark:invert`}
      />
      <img
        src={`${baseUrl}/about-bg-chevrons.webp`}
        alt=""
        className={`${shared} parallax-15 dark:invert`}
      />
      <img
        src={`${baseUrl}/about-bg-table-pedestal.webp`}
        alt=""
        className={`${shared} parallax-x-27 parallax-y-33`}
      />
      <img
        src={`${baseUrl}/about-bg-table-top.webp`}
        alt=""
        className={`${shared} parallax-x-27 parallax-y-27`}
      />
      <img
        src={`${baseUrl}/about-bg-zigzag.webp`}
        alt=""
        className={`${shared} parallax-20 dark:invert`}
      />
      <img
        src={`${baseUrl}/about-bg-arrows.webp`}
        alt=""
        className={`${shared} parallax-35 dark:invert`}
      />
    </div>
  );
}
