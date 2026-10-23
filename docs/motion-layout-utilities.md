# CSS layout and driver state utilities

Defined in `src/styles/global.css`.

| Utility           | Kind                       | Notes                                                                                                                                              |
| ----------------- | -------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| `vertical-text`   | Layout                     | `writing-mode: vertical-rl`; used by page titles.                                                                                                  |
| `title-fit`       | Layout                     | `font-size: 8rem; line-height: 1`; a fixed display size for vertical page titles, so collapsing mobile browser chrome cannot resize it mid-scroll. |
| `parallax-active` | Driver state (on viewport) | Added to `<html>` while a parallax driver animates; sets `will-change: transform` on layers.                                                       |
