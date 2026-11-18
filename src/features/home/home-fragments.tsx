const homeFragmentCopy = [
  {
    topic: "emerald",
    text: "Notes, essays and changelogs — every topic covered by writing on the m4t.tf blog.",
  },
  {
    topic: "plum",
    text: "A selection of projects I have built in my spare time, spanning film photography tools, terminal interfaces, and this very site.",
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
    topic: "gray",
    text: "Visual experiments and illustrations made for the joy of it. Studies of form and colour, and other loose ends.",
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
];

export function HomeFragments() {
  return (
    <div
      aria-hidden="true"
      data-home-fragments
      className="pointer-events-none absolute inset-0 z-0 hidden overflow-clip md:block"
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
