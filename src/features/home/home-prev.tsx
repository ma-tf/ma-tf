import { washTintClasses, type WashColor } from "@components/wash";
import { CDN_BASE } from "@lib/cdn";
import { cn } from "cn";

const homePrevImages: Partial<Record<WashColor, string>> = {
  emerald: "/tags-prev.png",
  ember: `${CDN_BASE}/photography/luxembourg-19-statues.avif`,
  blue: "/bolex-dither-anon3.png",
  taupe: `${CDN_BASE}/music/japan-6-19.avif`,
};

const homePrevImageClasses: Partial<Record<WashColor, string>> = {
  ember: "-scale-x-100",
  blue: "object-right",
};

const landing = "pointer-events-none absolute h-0 w-0";

export function HomePrev() {
  return (
    <div
      aria-hidden="true"
      data-fragments-avoid
      className="absolute top-1/2 right-16 isolate hidden -translate-y-1/2 flex-col items-start md:flex"
    >
      <img
        src="/home-prev-top2.png"
        alt=""
        loading="eager"
        decoding="async"
        className="relative z-10 max-w-none drop-shadow-chrome"
      />
      <span
        aria-hidden="true"
        data-wire-landing
        data-wire-origin="120,118"
        className={cn(landing, "top-1 right-5")}
      />
      <span aria-hidden="true" data-wire-landing className={cn(landing, "top-1 right-1")} />
      <span
        aria-hidden="true"
        data-wire-landing
        data-wire-origin="116,114"
        className={cn(landing, "top-3 right-5")}
      />
      <span aria-hidden="true" data-wire-landing className={cn(landing, "top-3 right-1")} />
      <span
        aria-hidden="true"
        data-wire-landing
        data-wire-linked
        className={cn(landing, "top-0.5 right-1")}
      />
      <div data-prev-band className="relative min-h-0 w-120.25 -translate-y-5">
        <div className="absolute inset-0 -z-10 bg-muted/50" />
        <div
          data-prev-reveal
          className="grid grid-rows-[0fr] transition-[grid-template-rows] duration-300 motion-reduce:transition-none"
        >
          <div className="min-h-0 overflow-hidden">
            <div className="grid">
              {(Object.keys(homePrevImages) as WashColor[]).map((wash) => (
                <div
                  key={wash}
                  data-prev-image={wash}
                  className="relative col-start-1 row-start-1 hidden w-full overflow-clip transition-[display] transition-discrete delay-300 duration-0 motion-reduce:transition-none"
                >
                  <span
                    aria-hidden="true"
                    className={cn("absolute inset-0", washTintClasses[wash])}
                  />
                  <img
                    src={homePrevImages[wash]}
                    alt=""
                    loading="lazy"
                    decoding="async"
                    className={cn("h-auto w-full opacity-60", homePrevImageClasses[wash])}
                  />
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-x-0 top-0 h-full animate-scanline"
                  />
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-0 crt-mask"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <span
        aria-hidden="true"
        data-preview-bottom
        className="relative z-10 block max-w-none -translate-y-5 drop-shadow-chrome transition-[translate] duration-150 motion-reduce:transition-none"
      >
        <img
          src="/home-prev-bottom3.png"
          alt=""
          loading="eager"
          decoding="async"
          className="block max-w-none"
        />
        <span aria-hidden="true" data-wire-landing className={cn(landing, "right-1 bottom-0")} />
      </span>
      <svg
        aria-hidden="true"
        focusable="false"
        data-home-wires-front
        stroke="currentColor"
        strokeWidth={1.25}
        className="pointer-events-none absolute inset-0 h-full w-full overflow-visible fill-none text-border opacity-70"
      >
        <path data-home-wire-front d="" />
        <path data-home-wire-front d="" />
      </svg>
    </div>
  );
}
