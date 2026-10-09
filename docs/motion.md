# Motion

`src/lib/parallax.ts` turns `data-parallax*` attributes into transforms, and
`src/styles/global.css` defines the entrance and scroll-reveal utilities. This
document is a reference for both: which attribute sets what, which driver runs at
which breakpoint, and the formulas from scroll or pointer position to transform.
For the timing rules see [ADR 011](adr/011-motion-timing-budget.md); for the skip
and replay control see [ADR 017](adr/017-motion-skip-control.md),
[ADR 018](adr/018-revisit-entrance-skip.md) and
[ADR 019](adr/019-replay-motion-control.md).

## Drivers

Two independent drivers are started once by `startParallax()` from
`Layout.astro`, and each disables itself when its breakpoint or motion condition
stops holding.

| Driver  | Runs when     | Reads input | Moves                                                                                 |
| ------- | ------------- | ----------- | ------------------------------------------------------------------------------------- |
| Pointer | width ≥ 768px | `mousemove` | every `[data-parallax]` layer in `document`                                           |
| Scroll  | width ≤ 767px | `scroll`    | `[data-parallax]` layers inside `[data-parallax-scroll]`, plus `[data-parallax-push]` |

- The breakpoint is `MOBILE_QUERY = "(max-width: 767px)"` in
  `src/lib/parallax.ts`; the pointer driver is the inverse.
- Both drivers stand down while `(prefers-reduced-motion: reduce)` matches.
- Pointer displacement is eased (`EASING = 0.05`) toward the cursor; scroll
  displacement is written directly (`easing = 1`).
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
| `data-parallax-push`            | page markup           | Marks the element the scroll driver pushes upward as the page scrolls (the first match). | absent   |
| `data-parallax-shove`           | page markup           | Marks the clamp boundary: the pushed element stops at this element's top edge.           | absent   |

Notes:

- A factor is `value / 100` (`DEFAULT_FACTOR`). A missing factor is 0, so the
  axis stays still — a bare `data-parallax` with no value registers a layer that
  never moves.
- `data-parallax-x` and `data-parallax-y` override a single axis of
  `data-parallax`; with only `data-parallax` set, both axes take its value.
- Under the scroll driver only the y factor has any effect, because the target x
  is always 0.
- The `-distance`, `-drift` and `-scale` values fall back to their defaults when
  the attribute is absent or parses to 0.
- `data-parallax-shove` has no call site yet; without it the push clamp is
  infinite.

## Progress to transforms

The scroll driver computes one `progress` per scroll event and applies it to
every layer:

```
progress = min(scrollY / (distance × innerHeight), 1)
y        = -progress × drift × innerHeight
```

Each layer writes `translate(x, y) scale(scale)` through the Web Animations API,
where `x` and `y` are the driver targets multiplied by the layer's own factors,
and the `scale()` term is present only when `scrollScale ≠ 1` (the overscan).

The pointer driver targets the cursor instead:

```
x = -(clientX / innerWidth  - 0.5) × 2 × 40
y = -(clientY / innerHeight - 0.5) × 2 × 40
```

`40` is `INTENSITY`, so the pointer moves a full-scale layer within ±40px on each
axis. The scroll and pointer positions are then scaled per layer by the layer's
factors before the transform is written.

The push has its own animator and a two-sided clamp:

```
bottom = max(0, innerHeight - title.offsetTop - title.offsetHeight - footer.offsetHeight - 8)
offset = bottom × progress
edge   = shove.top            // Infinity when no [data-parallax-shove]
span   = title.offsetTop + title.offsetHeight
pushY  = min(offset, edge - span)
```

So the pushed element rises by `bottom × progress` until its bottom reaches the
shove element's top edge (8px is `PUSH_BOTTOM_PAD`). `bottom` and `span` are
measured once when the driver starts.

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
`developers.astro` takes the defaults. Layer factors are
fixed in the component (`10`, `15`, `20`, `27/33`, `27/27`, `35`).

## Footer overlap contract

`src/components/Footer.astro` is in-flow (`static`) below 768px and a fixed
16px (`h-4`) overlay (`md:fixed md:bottom-0 md:h-4`) at desktop widths. On
mobile it is a two-column grid (`grid-cols-2`) with a `Resources` column
(`Developers`) and a `Site` column (`About`, `Contact`, `Privacy` stacked), plus
a right-aligned `Back to top` button spanning both columns, for a total of
roughly 227px. The three scroll-hero pages (`about`, `contact`,
`privacy`) clear it with `pb-36` on mobile and `md:pb-64` on desktop; the
desktop value also provides
scroll room for the reveal and push choreography. Keep either value above the
footer's height at its breakpoint when restyling.

## Reduced motion and the motion control

- `prefers-reduced-motion: reduce` disables both parallax drivers at
  `src/lib/parallax.ts`, and each entrance and reveal utility in
  `global.css`. The parallax drivers re-check on the media query's `change`
  event.
- The mobile `Back to top` button (`src/lib/scroll-to-top.ts`) scrolls smoothly
  by default and jumps when the media query matches.
- The `data-motion` control is separate. `data-motion="skipped"` (ADR 017) and
  `data-motion="revisit"` (ADR 018) disable only the page-load entrances;
  `skipped` also disables the scroll reveals. The parallax drivers are not
  gated by `data-motion` — ADR 017 scopes the control to entrances and reveals,
  leaving parallax to its own reduced-motion handling.
- The typewriter on `/developers` is treated as an entrance: `startTypewriter`
  declines under reduced motion or any `data-motion` value, and the control can
  finish it at once (ADR 017/019).
- The control is a server-rendered component plus the deferred
  `src/lib/motion-control.ts`, so it decides skip/reset before React would
  hydrate; `global.css` picks the icon from `data-mode` and `data-motion`
  ([ADR 022](adr/022-motion-control-runs-before-hydration.md)).
- Scroll-driven motion is exempt from the 150ms budget of
  [ADR 011](adr/011-motion-timing-budget.md): `animate-fade-in-scroll` maps to
  scroll position, not time, as do the parallax drivers. `animate-reveal` is
  trigger-based rather than scroll-linked; its duration is declared at the call
  site (`animate-reveal-<ms>`) and is also exempt from the 150ms cap.

## Theme transitions

Theme changes sweep through the View Transitions API. See
[ADR 010](adr/010-theme-transitions-via-view-transitions.md).

## Reveal trigger

`animate-reveal-<ms>` is not scroll-driven. Its hidden state is scoped to
`@media (scripting: enabled)`, so CSS itself gates it on scripting being
available, and `startReveal()` in `src/lib/reveal.ts` observes every
`[class*="animate-reveal"]` element with `IntersectionObserver`. The first time an
element comes roughly 25% into the viewport (`rootMargin: 0px 0px -25% 0px`,
once) the observer adds `is-revealed`, and a transition of the declared duration
(500ms by default, or the suffix of `animate-reveal-<ms>`) fades it in from
`opacity: 0` and `translateY(16px)`. Without scripting, or under reduced motion,
the hidden state never applies, so the elements stay visible with no flash.
`data-motion="skipped"` forces them visible.

## CSS utilities

Defined in `src/styles/global.css`.

| Utility                  | Kind                       | Notes                                                                                                                                                                                                                      |
| ------------------------ | -------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `animate-fade-in`        | Page-load entrance         | `flickerIn` over 1s; consumes `--delay`.                                                                                                                                                                                   |
| `animate-fade-up-*`      | Page-load entrance         | Wildcard: distance in px then optional `/duration` (`animate-fade-up-32/300`). Two keyframes.                                                                                                                              |
| `animate-reveal-*`       | Scroll reveal              | Wildcard: optional duration in ms, default 500 (`animate-reveal`, `animate-reveal-300`). Hidden under `@media (scripting: enabled)` until ~25% into view, then `is-revealed` transitions `opacity` and `translateY(16px)`. |
| `animate-fade-in-scroll` | Scroll reveal              | `animation-timeline: view()`, range `entry 10% … 70%`.                                                                                                                                                                     |
| `animation-delay-*`      | Delay token                | Sets `--delay` in ms; consumed by all of the above.                                                                                                                                                                        |
| `fade-move-delay-*`      | Delay token                | Sets `--fade-move-delay`, offsetting only the `animate-fade-up-*` move half.                                                                                                                                               |
| `vertical-text`          | Layout                     | `writing-mode: vertical-rl`; used by page titles.                                                                                                                                                                          |
| `title-fit`              | Layout                     | `font-size: min(8rem, 22.5dvh); line-height: 1`.                                                                                                                                                                           |
| `parallax-active`        | Driver state (on viewport) | Added to `<html>` while a parallax driver animates; sets `will-change: transform` on layers.                                                                                                                               |

Every entrance and reveal utility disables itself under
`prefers-reduced-motion: reduce`. `animate-icon-crossfade` and the typewriter
caret are continuous loops, also exempt from ADR 011.
