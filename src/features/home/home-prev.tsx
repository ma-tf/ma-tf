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

const cables = [
  { lane: "right-1", taut: "min-h-20", slack: "M1 0 V78 C1 90 7 90 7 78 V0" },
  { lane: "right-3", taut: "min-h-24", slack: "M1 0 V74 C1 88 7 88 7 74 V0" },
];

const cableTone = "text-steel-600 dark:text-steel-400";
const fade = "transition-opacity duration-150 motion-reduce:transition-none";

function HomePrevCables() {
  return (
    <>
      {cables.map(({ lane, taut }) => (
        <div
          key={lane}
          data-prev-taut
          className={cn(
            "pointer-events-none absolute top-0 bottom-2.5 w-1.25 opacity-0",
            fade,
            lane,
          )}
        >
          <svg
            viewBox="0 0 5 100"
            preserveAspectRatio="none"
            className={cn("h-full w-full", cableTone, taut)}
          >
            <line
              x1="0"
              y1="0"
              x2="5"
              y2="100"
              stroke="currentColor"
              strokeWidth="1"
              vectorEffect="non-scaling-stroke"
            />
          </svg>
        </div>
      ))}
      {cables.map(({ lane, slack }) => (
        <svg
          key={lane}
          data-prev-slack
          viewBox="0 0 8 96"
          className={cn("pointer-events-none absolute top-0 h-24 w-2", fade, cableTone, lane)}
        >
          <path d={slack} fill="none" stroke="currentColor" strokeWidth="1" />
        </svg>
      ))}
    </>
  );
}

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
      <div data-prev-band className="relative min-h-0 w-120.25 -translate-y-5">
        <div className="absolute inset-0 -z-10 bg-muted/50" />
        <HomePrevCables />
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
      <img
        src="/home-prev-bottom2.png"
        alt=""
        loading="eager"
        decoding="async"
        data-preview-bottom
        className="max-w-none -translate-y-5 drop-shadow-chrome transition-[translate] duration-150 motion-reduce:transition-none"
      />
    </div>
  );
}
