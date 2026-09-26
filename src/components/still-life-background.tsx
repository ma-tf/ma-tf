export function StillLifeBackground({ baseUrl }: { baseUrl: string }) {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute top-0 left-0 -z-10 aspect-4/3 h-dvh"
    >
      <img
        src={`${baseUrl}/about-bg-hexagons.webp`}
        alt=""
        className="absolute -inset-5 animate-fade-in object-contain dark:invert"
        data-parallax={10}
      />
      <img
        src={`${baseUrl}/about-bg-chevrons.webp`}
        alt=""
        className="absolute -inset-5 animate-fade-in object-contain animation-delay-250 dark:invert"
        data-parallax={15}
      />
      <img
        src={`${baseUrl}/about-bg-zigzag.webp`}
        alt=""
        className="absolute -inset-5 animate-fade-in object-contain animation-delay-750 dark:invert"
        data-parallax={20}
      />
      <img
        src={`${baseUrl}/about-bg-table-pedestal.webp`}
        alt=""
        className="absolute -inset-5 animate-fade-up-32/300 object-contain animation-delay-150 fade-move-delay-200"
        data-parallax-x={27}
        data-parallax-y={33}
      />
      <img
        src={`${baseUrl}/about-bg-table-top.webp`}
        alt=""
        className="absolute -inset-5 animate-fade-up object-contain animation-delay-200"
        data-parallax-x={27}
        data-parallax-y={27}
      />
      <img
        src={`${baseUrl}/about-bg-arrows.webp`}
        alt=""
        className="absolute -inset-5 animate-fade-in object-contain animation-delay-900 dark:invert"
        data-parallax={35}
      />
    </div>
  );
}
