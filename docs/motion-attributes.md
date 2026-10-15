# Motion attributes

Set by hand in JSX or `.astro` markup, except `StillLifeBackground`'s, which its
props render.

| Attribute                       | Set by                             | Meaning                                                                                     | Default           |
| ------------------------------- | ---------------------------------- | ------------------------------------------------------------------------------------------- | ----------------- |
| `data-parallax`                 | page markup                        | Factor for both axes, as a percentage of the driver's base displacement (`40` → 0.4).       | none (0)          |
| `data-parallax-x`               | page markup                        | Overrides the x factor only.                                                                | none (0)          |
| `data-parallax-y`               | page markup                        | Overrides the y factor only.                                                                | none (0)          |
| `data-parallax-mobile`          | page markup                        | Scroll-driver-only factor for both axes; overrides `data-parallax` on touch layouts.        | `data-parallax`   |
| `data-parallax-mobile-x`        | page markup                        | Overrides the x factor only (scroll driver).                                                | `data-parallax-x` |
| `data-parallax-mobile-y`        | page markup                        | Overrides the y factor only (scroll driver).                                                | `data-parallax-y` |
| `data-parallax-scroll`          | `StillLifeBackground`, page markup | Marks a frame the scroll driver scopes to and configures independently (one animator each). | absent            |
| `data-parallax-scroll-distance` | `StillLifeBackground`, page markup | `scrollDistance`: viewport heights of scroll before `progress` reaches 1.                   | 1                 |
| `data-parallax-scroll-drift`    | `StillLifeBackground`, page markup | `scrollDrift`: fraction of the viewport a full-drift layer travels.                         | 0.3               |
| `data-parallax-scroll-scale`    | `StillLifeBackground`, page markup | `scrollScale`: overscan multiplier applied to every scroll layer's transform.               | 1                 |
| `data-parallax-push`            | page markup                        | Marks the element the scroll driver drifts down as the page scrolls (the first match).      | absent            |

Notes:

- `data-parallax-x` and `data-parallax-y` override a single axis of
  `data-parallax`; with only `data-parallax` set, both axes take its value.
- `data-parallax-mobile`, `-x` and `-y` are read only by the scroll driver. When
  one is absent the layer falls back to its `data-parallax*` value, so a layer
  can keep its desktop factor and tune its own touch factor.
- Under the scroll driver only the y factor has any effect.
- The `-distance`, `-drift` and `-scale` values fall back to their defaults when
  the attribute is absent or parses to 0.
