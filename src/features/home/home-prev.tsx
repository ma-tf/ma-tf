import { cn } from "cn";

type HomePrevWash = "emerald" | "plum" | "ember" | "blue" | "gray" | "taupe";

type HomePrevCopy = {
  lead: string | null;
  paragraphs: string[];
};

const homePrevCopy: Record<HomePrevWash, HomePrevCopy> = {
  emerald: {
    lead: "Latest writing.",
    paragraphs: ["Every topic covered by writing on the m4t.tf blog."],
  },
  plum: {
    lead: "Things I build and ship.",
    paragraphs: [
      "A selection of projects I have built in my spare time, spanning film photography tools, terminal interfaces, and this very site.",
    ],
  },
  ember: {
    lead: "Digital and analogue photography.",
    paragraphs: [
      "In my spare time I am an amateur photographer. I shoot on both digital and film, and have collected a small family of cameras over the years, each covering a different use case.",
      "The cameras I use include: a Canon EOS-1V as my primary camera with swappable lenses; an Olympus mju mini Digital for when I want retro digital shots; a Ricoh Mirai when I need an all rounder bridge camera. They have served me well so far.",
      "I scan every roll myself on a Nikon CoolScan V ED using SilverFast, and colour correct the frames in SilverFast HDR. It's a slow, hands-on part of the process, but it's become as much a part of the craft as the shooting itself.",
    ],
  },
  blue: {
    lead: "Experimental motion work; exploring through the lens.",
    paragraphs: [
      "A series of short motion studies, shot on location in the quiet hours. Small observations of a place and the details that give it character. Photographs freeze a single instant, but some places only come alive in motion. The speed of a moving train, the swing of shoes on a wire, the rolling waves on a beach during sunset. These studies are an attempt to hold on to those moving moments.",
      "The Bolex H-16 SBM offers a portable way to create true filmic experiences without electricity as a hard requirement. Using 30 metre film reels and a wind-up motor, I can shoot scenes up to 30 seconds long with a maximum of approximately 2 minutes and 45 seconds of footage per reel. For my own convenience, I use a battery powered Kern Vario-Switar 16-100mm lens. The battery powers the auto exposure and the in-built electric motor for zooming.",
      "Everything is shot on 16mm film. Its grain and tonal latitude give the footage a texture that digital struggles to match, and the format's soft, rounded frame corners come straight from the lens and gate rather than any filter. Shooting on film is an exercise in economy. Each scene is a single take with no chance to delete or reshoot without paying for the footage again, so every second has to be deliberate. That constraint is part of what makes the format so rewarding.",
    ],
  },
  gray: {
    lead: "Digital illustrations and visual experiments.",
    paragraphs: [
      "Visual experiments and illustrations made for the joy of it. Studies of form and colour, and other loose ends.",
    ],
  },
  taupe: {
    lead: "Original compositions, remixes, and live recordings.",
    paragraphs: [
      "My music splits into two strands. The drum and bass leans into an atmospheric style. Long evolving pads sit under chopped breaks, the space left between them doing as much work as the drums themselves. It is built around tension and groove - breaks cut up and re-assembled, with percussion threading through the gaps to keep things moving forward. The ambient work moves slower, toward darker, more sinister soundscapes. Drone and texture over melody, made to fill a room rather than hold a hook.",
    ],
  },
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
              {Object.entries(homePrevCopy).map(([wash, { lead, paragraphs }]) => (
                <div
                  key={wash}
                  data-prev-text={wash}
                  className="col-start-1 row-start-1 hidden space-y-2 p-6 pr-8 text-sm leading-tight text-foreground transition-[display] transition-discrete duration-300 motion-reduce:transition-none"
                >
                  {lead ? (
                    <p className="text-xs tracking-widest uppercase opacity-70">{lead}</p>
                  ) : null}
                  {paragraphs.map((paragraph) => (
                    <p key={paragraph}>{paragraph}</p>
                  ))}
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
