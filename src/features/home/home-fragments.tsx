const homeFragmentCopy = [
  {
    topic: "emerald",
    text: "Notes, essays and changelogs — every topic covered by writing on the m4t.tf blog.",
  },
  {
    topic: "emerald",
    text: "Practical writing on programming, agent tooling and the small tools that make a working day go a little more smoothly.",
  },
  {
    topic: "emerald",
    text: "Posts tend to be honest about the mess: what broke, what I would do differently, and the reasoning between the two.",
  },
  {
    topic: "emerald",
    text: "Every post ships as a feed, and every page has a markdown twin made for agents to read.",
  },
  {
    topic: "plum",
    text: "A selection of projects I have built in my spare time, spanning film photography tools, terminal interfaces, and this very site.",
  },
  {
    topic: "plum",
    text: "Open-source work on GitHub: a film-grain tool for digital images, a metadata editor for a Canon EOS-1V, and a Docker Compose TUI.",
  },
  {
    topic: "plum",
    text: "Each one starts as a small annoyance worth fixing and grows only as far as it needs to.",
  },
  {
    topic: "plum",
    text: "Source and notes sit alongside the writing, so the code and the story behind it stay in one place.",
  },
  {
    topic: "ember",
    text: "An amateur photographer shooting both digital and film, with a small family of cameras each covering a different use case.",
  },
  {
    topic: "ember",
    text: "A Canon EOS-1V with swappable lenses as primary, an Olympus mju mini Digital for retro shots, and a Ricoh Mirai all rounder.",
  },
  {
    topic: "ember",
    text: "Every roll is scanned on a Nikon CoolScan V ED with SilverFast, then colour corrected by hand in SilverFast HDR.",
  },
  {
    topic: "ember",
    text: "I am drawn to quiet, overlooked places: underground passages, stairwells and empty stations in the early morning.",
  },
  {
    topic: "blue",
    text: "Short motion studies shot on location in the quiet hours, holding on to the moving moments photographs freeze.",
  },
  {
    topic: "blue",
    text: "Shot on a wind-up Bolex H-16 SBM with 30 metre reels — up to 30 seconds a scene, no electricity required.",
  },
  {
    topic: "blue",
    text: "Every scene is a single take on 16mm film: no deletes, no reshoots, and every second deliberate.",
  },
  {
    topic: "blue",
    text: "Each vignette is a brief study of motion and place: rain at Ōgimachi, a train between buildings, a sunset over Fuji.",
  },
  {
    topic: "gray",
    text: "Visual experiments and illustrations made for the joy of it. Studies of form and colour, and other loose ends.",
  },
  {
    topic: "gray",
    text: "Fractal flames, generative studies and odd bits of visual play, made in whatever tool suits the idea.",
  },
  {
    topic: "gray",
    text: "Nothing here is commissioned. It is a sketchbook kept in public, updated whenever the mood takes me.",
  },
  {
    topic: "gray",
    text: "Colour, texture and repetition are reasons to look at something closely for a while.",
  },
  {
    topic: "taupe",
    text: "The drum and bass leans atmospheric: long evolving pads under chopped breaks, the space between them doing the work.",
  },
  {
    topic: "taupe",
    text: "Breaks cut up and re-assembled, percussion threading the gaps to keep things moving forward.",
  },
  {
    topic: "taupe",
    text: "The ambient work moves slower, toward darker soundscapes — drone and texture over melody, made to fill a room.",
  },
  {
    topic: "taupe",
    text: "Released on Bandcamp and recorded to tape: full albums, DJ sets and the occasional experiment with a new synth.",
  },
];

export function HomeFragments() {
  return (
    <div
      aria-hidden="true"
      data-home-fragments
      data-parallax={22}
      className="pointer-events-none absolute inset-0 z-0 hidden overflow-clip perspective-midrange md:block"
    >
      {homeFragmentCopy.map((fragment) => (
        <p
          key={fragment.text}
          data-home-fragment
          data-fragment-topic={fragment.topic}
          hidden
          className="invisible absolute w-56 font-mono text-2xs leading-snug text-muted-foreground opacity-0 transition-opacity ease-in-out motion-reduce:transition-none"
        >
          {fragment.text}
        </p>
      ))}
    </div>
  );
}
