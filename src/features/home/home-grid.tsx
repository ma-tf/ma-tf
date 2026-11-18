import { Wash } from "@components/wash";
import { Sphere } from "@features/home/sphere";
import { CDN_BASE } from "@lib/cdn";

const TRANSPARENT_IMAGE =
  "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";

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
            src={TRANSPARENT_IMAGE}
            data-src={`${CDN_BASE}/photography/luxembourg-19-statues.avif`}
            alt=""
            hidden
            loading="lazy"
            decoding="async"
            className="h-full w-4/5 -scale-x-100 mask-mirrored-fade-l object-cover opacity-60"
          />
        </div>
      </Wash>
      <Wash color="taupe">
        <img
          src={TRANSPARENT_IMAGE}
          data-src={`${CDN_BASE}/music/japan-6-19.avif`}
          alt=""
          hidden
          loading="lazy"
          decoding="async"
          className="absolute inset-0 h-full w-full mask-l-from-black mask-l-to-transparent mask-l-to-75% object-cover opacity-60"
        />
      </Wash>
      <Wash color="blue">
        <img
          src={TRANSPARENT_IMAGE}
          data-src={`${CDN_BASE}/vignettes/bolex-dither-anon2.png`}
          alt=""
          hidden
          loading="lazy"
          decoding="async"
          className="absolute inset-0 h-full w-full mask-l-from-black mask-l-to-transparent mask-l-to-75% object-cover object-bottom-left opacity-60"
        />
      </Wash>
      <Wash color="emerald">
        <img
          src={TRANSPARENT_IMAGE}
          data-src={`${CDN_BASE}/blog/tags-bg-2.webp`}
          alt=""
          hidden
          loading="lazy"
          decoding="async"
          className="absolute inset-0 h-full w-full translate-x-4/9 mask-l-from-black mask-l-to-transparent object-cover object-top-left opacity-60"
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
