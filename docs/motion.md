# Motion

`src/lib/parallax.ts` turns `data-parallax*` attributes into transforms, and
`src/styles/global.css` defines the entrance and scroll-reveal utilities. This
document is a reference: which attribute sets what, and which driver runs where.
For the timing rules see [ADR 011](adr/011-motion-timing-budget.md); for the
skip, replay and revisit control see
[ADR 019](adr/019-replay-motion-control.md).

## Drivers

Two independent drivers are started once by `startParallax()` from
`Layout.astro`, and each disables itself when its breakpoint or motion condition
stops holding.

| Driver  | Runs when     | Reads input | Moves                                                                                 |
| ------- | ------------- | ----------- | ------------------------------------------------------------------------------------- |
| Pointer | width ≥ 768px | `mousemove` | every `[data-parallax]` layer in `document`                                           |
| Scroll  | width ≤ 767px | `scroll`    | `[data-parallax]` layers inside `[data-parallax-scroll]`, plus `[data-parallax-push]` |

- The breakpoint is `(max-width: 767px)`; the pointer driver is the inverse.
- Both drivers stand down while `(prefers-reduced-motion: reduce)` matches.
- The pointer driver eases toward the cursor; the scroll driver is written
  directly.
- While a driver is animating it adds `parallax-active` to `<html>`, which turns
  on `will-change: transform` for parallax layers.

The two selectors are not the same set. The pointer driver matches
`[data-parallax], [data-parallax-x], [data-parallax-y]` anywhere in the document.
The scroll driver matches only descendants of `[data-parallax-scroll]`, so page
content that carries `data-parallax` outside a scroll frame moves on desktop and
stays still on mobile.

## Attributes

Set by hand in JSX or `.astro` markup, except `StillLifeBackground`'s, which its
props render.

| Attribute                       | Set by                | Meaning                                                                                  | Default  |
| ------------------------------- | --------------------- | ---------------------------------------------------------------------------------------- | -------- |
| `data-parallax`                 | page markup           | Factor for both axes, as a percentage of the driver's base displacement (`40` → 0.4).    | none (0) |
| `data-parallax-x`               | page markup           | Overrides the x factor only.                                                             | none (0) |
| `data-parallax-y`               | page markup           | Overrides the y factor only.                                                             | none (0) |
| `data-parallax-scroll`          | `StillLifeBackground` | Marks the frame the scroll driver scopes to and reads its config from (the first match). | absent   |
| `data-parallax-scroll-distance` | `StillLifeBackground` | `scrollDistance`: viewport heights of scroll before `progress` reaches 1.                | 1        |
| `data-parallax-scroll-drift`    | `StillLifeBackground` | `scrollDrift`: fraction of the viewport a full-drift layer travels.                      | 0.3      |
| `data-parallax-scroll-scale`    | `StillLifeBackground` | `scrollScale`: overscan multiplier applied to every scroll layer's transform.            | 1        |
| `data-parallax-push`            | page markup           | Marks the element the scroll driver drifts down as the page scrolls (the first match).   | absent   |

Notes:

- `data-parallax-x` and `data-parallax-y` override a single axis of
  `data-parallax`; with only `data-parallax` set, both axes take its value.
- Under the scroll driver only the y factor has any effect.
- The `-distance`, `-drift` and `-scale` values fall back to their defaults when
  the attribute is absent or parses to 0.

## StillLifeBackground

`src/components/still-life-background.tsx` renders the six-layer still life. It
sets `data-parallax-scroll` on its root and a `data-parallax` factor on each
image; the props are the scroll config the driver reads back off the frame.

| Prop             | Attribute set                   | Default | Effect                         |
| ---------------- | ------------------------------- | ------- | ------------------------------ |
| `baseUrl`        | image `src` prefix              | —       | `baseUrl + /about-bg-*.webp`   |
| `className`      | root class list                 | —       | page-specific placement/sticky |
| `scrollDistance` | `data-parallax-scroll-distance` | 1       | scroll length to full progress |
| `scrollDrift`    | `data-parallax-scroll-drift`    | 0.3     | travel at full progress        |
| `scrollScale`    | `data-parallax-scroll-scale`    | 1       | overscan scale on each layer   |

Per-page choreography lives at the call site, not in the component: the numbers
are passed as props from the page's `.astro` file. `about.astro`, `contact.astro`
and `privacy.astro` spread the shared `stillLifeScroll` preset from
`still-life-hero.tsx` (`scrollDistance: 1.5`, `scrollDrift: 0.4`,
`scrollScale: 1.15`), passing explicit props after the spread to override it;
`developers.astro` takes the defaults.

## Footer overlap contract

`src/components/Footer.astro` is in-flow (`static`) below 768px and a fixed
16px (`h-4`) overlay (`md:fixed md:bottom-0 md:h-4`) at desktop widths. On
mobile it is a two-column grid (`grid-cols-2`) with an `Explore` column
(`Blog`, `Photography`, `Graphics`, `Music`, `Vignettes` stacked) beside a
`Site` column (`About`, `Contact`, `Privacy` stacked), a `Resources` column
(`Developers`) wrapping onto the second row, and a right-aligned `Back to top`
button spanning both columns, for a total of roughly 390px. The three
scroll-hero pages (`about`, `contact`, `privacy`) fill a `100dvh` grid split
65:35 between the header and the top-aligned card row, and pad the card row with
`py-12` at desktop widths; keep that padding above the footer's height when
restyling.

## Reduced motion and the motion control

- `prefers-reduced-motion: reduce` disables both parallax drivers in
  `src/lib/parallax.ts`, and each entrance and reveal utility in `global.css`.
- The mobile `Back to top` button (`src/lib/scroll-to-top.ts`) scrolls smoothly
  by default and jumps when the media query matches.
- The `data-motion` control is separate. `data-motion="skipped"` and
  `data-motion="revisit"` (ADR 019) disable only the page-load entrances;
  `skipped` also disables the scroll reveals. The parallax drivers are not
  gated by `data-motion` — the control is scoped to entrances and reveals,
  leaving parallax to its own reduced-motion handling.
- The typewriter on `/developers` is treated as an entrance: `startTypewriter`
  declines under reduced motion or any `data-motion` value, and the control can
  finish it at once (ADR 019).
- The control is a server-rendered component plus the deferred
  `src/lib/motion-control.ts`, so it decides skip/reset before React would
  hydrate; `global.css` picks the icon from `data-mode` and `data-motion`
  ([ADR 019](adr/019-replay-motion-control.md)).
- Scroll-driven motion is exempt from the 150ms budget of
  [ADR 011](adr/011-motion-timing-budget.md): `animate-fade-in-scroll` maps to
  scroll position, not time, as do the parallax drivers. `animate-reveal` is
  trigger-based rather than scroll-linked; its duration is declared at the call
  site (`animate-reveal-<ms>`) and is also exempt from the 150ms cap.

## Theme transitions

Theme changes sweep through the View Transitions API. See
[ADR 010](adr/010-theme-transitions-via-view-transitions.md).

## Reveal trigger

`animate-reveal-<ms>` is not scroll-driven. `startReveal()` in
`src/lib/reveal.ts` observes every `[class*="animate-reveal"]` element with
`IntersectionObserver` and, once one comes into view, adds `is-revealed` so a
transition of the declared duration fades it in. The hidden state is scoped to
`@media (scripting: enabled)`, so without scripting, or under reduced motion, the
elements stay visible with no flash. `data-motion="skipped"` forces them visible.
The still-life cards keep the reveal mobile-only: their desktop layout fits the
viewport, so the cards never scroll into the observer's shrunken root, and a
call-site `md:opacity-100 md:transform-none` cancels the hidden state above `md:`.

## CSS utilities

Defined in `src/styles/global.css`.

| Utility                  | Kind                       | Notes                                                                                                                                                                                                                                                                                                                                                                                                   |
| ------------------------ | -------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `animate-fade-in`        | Page-load entrance         | `flickerIn` over 1s; consumes `--delay`.                                                                                                                                                                                                                                                                                                                                                                |
| `animate-fade-up-*`      | Page-load entrance         | Wildcard: distance in px then optional `/duration` (`animate-fade-up-32/300`). Two keyframes.                                                                                                                                                                                                                                                                                                           |
| `animate-reveal-*`       | Scroll reveal              | Wildcard: optional duration in ms, default 500 (`animate-reveal`, `animate-reveal-300`). Hidden under `@media (scripting: enabled)` until ~25% into view, then `is-revealed` transitions `opacity` and `translateY(16px)`. The hidden state lives inside the utility, so a call site can cancel it above `md:` with `md:opacity-100 md:transform-none`; the still-life cards hold the reveal to mobile. |
| `animate-fade-in-scroll` | Scroll reveal              | `animation-timeline: view()`, range `entry 10% … 70%`.                                                                                                                                                                                                                                                                                                                                                  |
| `animation-delay-*`      | Delay token                | Sets `--delay` in ms; consumed by all of the above.                                                                                                                                                                                                                                                                                                                                                     |
| `fade-move-delay-*`      | Delay token                | Sets `--fade-move-delay`, offsetting only the `animate-fade-up-*` move half.                                                                                                                                                                                                                                                                                                                            |
| `vertical-text`          | Layout                     | `writing-mode: vertical-rl`; used by page titles.                                                                                                                                                                                                                                                                                                                                                       |
| `title-fit`              | Layout                     | `font-size: min(8rem, 22.5dvh); line-height: 1`; at `width >= 48rem` the size clamps to `min(8rem, 13dvh)` so the longest title fits the 65% header row.                                                                                                                                                                                                                                                |
| `parallax-active`        | Driver state (on viewport) | Added to `<html>` while a parallax driver animates; sets `will-change: transform` on layers.                                                                                                                                                                                                                                                                                                            |

Every entrance and reveal utility disables itself under
`prefers-reduced-motion: reduce`. `animate-icon-crossfade` and the typewriter
caret are continuous loops, also exempt from ADR 011.
