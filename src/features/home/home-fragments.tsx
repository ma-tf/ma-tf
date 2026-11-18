const homeFragmentCopy = [
  "Notes, essays and changelogs — every topic covered by writing on the m4t.tf blog.",
  "A selection of projects I have built in my spare time, spanning film photography tools, terminal interfaces, and this very site.",
  "An amateur photographer shooting both digital and film, with a small family of cameras each covering a different use case.",
  "A Canon EOS-1V with swappable lenses as primary, an Olympus mju mini Digital for retro shots, and a Ricoh Mirai all rounder.",
  "Every roll is scanned on a Nikon CoolScan V ED with SilverFast, then colour corrected by hand in SilverFast HDR.",
  "Short motion studies shot on location in the quiet hours, holding on to the moving moments photographs freeze.",
  "Shot on a wind-up Bolex H-16 SBM with 30 metre reels — up to 30 seconds a scene, no electricity required.",
  "Every scene is a single take on 16mm film: no deletes, no reshoots, and every second deliberate.",
  "Visual experiments and illustrations made for the joy of it. Studies of form and colour, and other loose ends.",
  "The drum and bass leans atmospheric: long evolving pads under chopped breaks, the space between them doing the work.",
  "Breaks cut up and re-assembled, percussion threading the gaps to keep things moving forward.",
  "The ambient work moves slower, toward darker soundscapes — drone and texture over melody, made to fill a room.",
];

export function HomeFragments() {
  return (
    <div
      aria-hidden="true"
      data-home-fragments
      className="pointer-events-none absolute inset-0 z-0 hidden overflow-clip md:block"
    >
      {homeFragmentCopy.map((copy) => (
        <p
          key={copy}
          data-home-fragment
          hidden
          className="invisible absolute w-56 font-mono text-2xs leading-snug text-muted-foreground opacity-0 transition-opacity ease-in-out motion-reduce:transition-none"
        >
          {copy}
        </p>
      ))}
    </div>
  );
}
