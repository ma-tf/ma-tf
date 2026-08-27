const IMAGE_KEYS = [
  "vignettes/bolex-bg-dither.png",
  "vignettes/bolex-fg-dither-anon.png",
  "graphics/old house.png",
  "music/20251014_Japan 6_19.jpg",
] as const;

export type ImageKey = (typeof IMAGE_KEYS)[number];
export type ImageMap = Record<ImageKey, string>;
