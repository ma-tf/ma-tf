import { cn } from "cn";

export function StillLifeBackground({
  baseUrl,
  className,
  scrollDistance = 1,
  scrollDrift = 0.3,
  scrollScale = 1,
}: {
  baseUrl: string;
  className?: string;
  scrollDistance?: number;
  scrollDrift?: number;
  scrollScale?: number;
}) {
  return (
    <div
      aria-hidden="true"
      data-parallax-scroll
      data-parallax-scroll-distance={scrollDistance}
      data-parallax-scroll-drift={scrollDrift}
      data-parallax-scroll-scale={scrollScale}
      className={cn(
        "pointer-events-none fixed inset-0 -z-10 overflow-hidden md:absolute md:inset-auto md:top-0 md:left-0 md:aspect-4/3 md:h-dvh md:overflow-visible",
        className,
      )}
    >
      <img
        src={`${baseUrl}/about-bg-hexagons.webp`}
        alt=""
        className="absolute inset-0 h-full w-full origin-top-left animate-fade-in object-cover object-left md:-inset-5 md:scale-110 md:object-contain dark:invert"
        data-parallax={10}
      />
      <img
        src={`${baseUrl}/about-bg-chevrons.webp`}
        alt=""
        className="absolute inset-0 h-full w-full origin-top-left animate-fade-in object-cover object-left animation-delay-250 md:-inset-5 md:scale-110 md:object-contain dark:invert"
        data-parallax={15}
      />
      <img
        src={`${baseUrl}/about-bg-zigzag.webp`}
        alt=""
        className="absolute inset-0 h-full w-full origin-top-left animate-fade-in object-cover object-left animation-delay-750 md:-inset-5 md:scale-110 md:object-contain dark:invert"
        data-parallax={20}
      />
      <img
        src={`${baseUrl}/about-bg-table-pedestal.webp`}
        alt=""
        className="absolute inset-0 h-full w-full origin-top-left animate-fade-up-32/300 object-cover object-left animation-delay-150 fade-move-delay-200 md:-inset-5 md:scale-110 md:object-contain"
        data-parallax-x={27}
        data-parallax-y={33}
      />
      <img
        src={`${baseUrl}/about-bg-table-top.webp`}
        alt=""
        className="absolute inset-0 h-full w-full origin-top-left animate-fade-up object-cover object-left animation-delay-200 md:-inset-5 md:scale-110 md:object-contain"
        data-parallax-x={27}
        data-parallax-y={27}
      />
      <img
        src={`${baseUrl}/about-bg-arrows.webp`}
        alt=""
        className="absolute inset-0 h-full w-full origin-top-left animate-fade-in object-cover object-left animation-delay-900 md:-inset-5 md:scale-110 md:object-contain dark:invert"
        data-parallax={35}
      />
    </div>
  );
}
