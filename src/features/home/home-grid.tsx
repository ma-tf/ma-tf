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
      <Wash color="plum" />
      <Wash color="ember">
        <div aria-hidden="true" className="absolute inset-0 flex items-start justify-end">
          <img
            data-src="https://cdn.m4t.tf/photography/luxembourg-19-statues.avif"
            alt=""
            loading="lazy"
            decoding="async"
            className="h-full w-4/5 -scale-x-100 mask-mirrored-fade-l object-cover mix-blend-luminosity contrast-105"
          />
        </div>
        <span
          aria-hidden="true"
          className="absolute inset-0 bg-linear-to-r from-background via-background/60 to-transparent"
        />
      </Wash>
      <Wash color="taupe">
        <img
          data-src="https://cdn.m4t.tf/music/japan-6-19.avif"
          alt=""
          loading="lazy"
          decoding="async"
          className="absolute inset-0 h-full w-full mask-l-from-black mask-l-to-transparent mask-l-to-75% object-cover mix-blend-luminosity contrast-105"
        />
        <span
          aria-hidden="true"
          className="absolute inset-0 bg-linear-to-r from-background via-background/60 to-transparent"
        />
      </Wash>
      <Wash color="blue">
        <img
          data-src="https://cdn.m4t.tf/vignettes/bolex-dither-anon2.png"
          alt=""
          loading="lazy"
          decoding="async"
          className="absolute inset-0 h-full w-full mask-l-from-black mask-l-to-transparent mask-l-to-75% object-cover object-bottom-left mix-blend-luminosity contrast-105"
        />
        <span
          aria-hidden="true"
          className="absolute inset-0 bg-linear-to-r from-background via-background/60 to-transparent"
        />
      </Wash>
      <Wash color="emerald">
        <img
          data-src="https://cdn.m4t.tf/blog/tags-bg-2.webp"
          alt=""
          loading="lazy"
          decoding="async"
          className="absolute inset-0 h-full w-full translate-x-4/9 mask-l-from-black mask-l-to-transparent object-cover object-top-left mix-blend-luminosity contrast-105"
        />
        <span
          aria-hidden="true"
          className="absolute inset-0 bg-linear-to-r from-background via-background/60 to-transparent"
        />
      </Wash>
      <script
        dangerouslySetInnerHTML={{
          __html:
            "(function(){var seen={};function load(color){if(!color||seen[color])return;seen[color]=1;var img=document.querySelector('span[data-wash=\"'+color+'\"] img[data-src]');if(img&&img.getAttribute('data-src')){img.setAttribute('src',img.getAttribute('data-src'));img.removeAttribute('data-src');}}function onEvent(e){var t=e.target&&e.target.closest?e.target.closest('[data-title][data-wash]'):null;if(t)load(t.getAttribute('data-wash'));}document.addEventListener('pointerover',onEvent,{passive:true});document.addEventListener('focusin',onEvent);})();",
        }}
      />
    </>
  );
}
