# CSS layout and driver state utilities

Defined in `src/styles/global.css`.

| Utility           | Kind                       | Notes                                                                                                                                                              |
| ----------------- | -------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `vertical-text`   | Layout                     | `writing-mode: vertical-rl`; used by page titles.                                                                                                                  |
| `title-fit`       | Layout                     | `font-size: min(8rem, 13dvh); line-height: 1`; the `dvh` clamp keeps the longest vertical title fitting the viewport height, and the `65%` header row above `md:`. |
| `parallax-active` | Driver state (on viewport) | Added to `<html>` while a parallax driver animates; sets `will-change: transform` on layers.                                                                       |
