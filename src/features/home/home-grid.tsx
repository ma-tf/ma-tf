import { Wash } from "@components/wash";
import { Sphere } from "@features/home/sphere";

export function HomeGrid() {
  return (
    <>
      <div
        aria-hidden="true"
        data-grid
        className="pointer-events-none absolute inset-0 -z-10 overflow-hidden mask-depth-fog transition-opacity duration-150 ease-out motion-reduce:transition-none"
      >
        <div className="absolute inset-0 opacity-55">
          <Sphere variant="base" />
        </div>
        <div className="absolute inset-0 grid-spotlight-240 transition-opacity duration-150 ease-out">
          <Sphere variant="spotlight" />
        </div>
      </div>
      <Wash color="gray" />
      <Wash color="ember">
        <div aria-hidden="true" className="absolute inset-0 flex items-start justify-end">
          <img
            src="https://cdn.m4t.tf/photography/luxembourg-19-statues.avif"
            alt=""
            loading="eager"
            decoding="async"
            fetchPriority="high"
            className="h-auto w-4/5 -scale-x-100 mask-mirrored-fade-l mix-blend-luminosity contrast-105 grayscale"
          />
        </div>
        <span
          aria-hidden="true"
          className="absolute inset-0 bg-linear-to-r from-background via-background/60 to-transparent"
        />
      </Wash>
      <Wash color="taupe">
        <img
          src="https://cdn.m4t.tf/music/20251014_Japan%206_19.webp"
          alt=""
          loading="eager"
          decoding="async"
          fetchPriority="high"
          className="absolute inset-0 h-full w-full mask-l-from-black mask-l-to-transparent mask-l-to-75% object-cover mix-blend-luminosity contrast-105 grayscale"
        />
        <span
          aria-hidden="true"
          className="absolute inset-0 bg-linear-to-r from-background via-background/60 to-transparent"
        />
      </Wash>
      <Wash color="blue">
        <img
          src="https://cdn.m4t.tf/vignettes/bolex-dither-anon2.png"
          alt=""
          loading="eager"
          decoding="async"
          fetchPriority="high"
          className="absolute inset-0 h-full w-full mask-l-from-black mask-l-to-transparent mask-l-to-75% object-cover object-bottom-left mix-blend-luminosity contrast-105 grayscale"
        />
        <span
          aria-hidden="true"
          className="absolute inset-0 bg-linear-to-r from-background via-background/60 to-transparent"
        />
      </Wash>
      <Wash color="emerald">
        <img
          src="https://cdn.m4t.tf/blog/tags-bg-2.webp"
          alt=""
          loading="eager"
          decoding="async"
          fetchPriority="high"
          className="absolute inset-0 h-full w-full translate-x-4/9 mask-l-from-black mask-l-to-transparent object-cover object-top-left mix-blend-luminosity contrast-105 grayscale"
        />
        <span
          aria-hidden="true"
          className="absolute inset-0 bg-linear-to-r from-background via-background/60 to-transparent"
        />
      </Wash>
    </>
  );
}
