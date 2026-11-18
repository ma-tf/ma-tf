# Still life background

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
are passed as props from the page's `.astro` file. `about.astro`, `contact.astro`,
`privacy.astro` and `developers.astro` all spread the shared `stillLifeScroll`
preset from `still-life-hero.tsx` (`scrollDistance: 1.5`, `scrollDrift: 0.4`,
`scrollScale: 1.15`).

`about.astro`, `contact.astro` and `privacy.astro` carry no scroll parallax of
their own: the still life is the only scroll frame on those pages, and the cards
animate only through the reveal. Their `<section>` stays a plain container so the
card copy and corner brackets never drift apart.

## Drip

`startStillLifeDripShader()` (`src/lib/still-life-drip-shader.ts`) renders a
WebGL metaball drop that swells under the drawn mushroom cap, necks, falls to
the objects' floor line and splashes, refracting the art through itself. One
8.5s cycle on a canvas inside the still-life parallax positioner, so pointer
and scroll drift keep it pinned to the cap; the canvas is transparent at rest
and the loop skips rendering between splashes. It is continuous decorative
motion — exempt from the 150ms budget of
[ADR 011](adr/011-motion-timing-budget.md) and not gated by `data-motion`.
`prefers-reduced-motion` draws one static frame of the hanging drop; no
WebGL means no drip. Refraction samples composite crops
(`public/still-life-drip-light.webp`, `-dark.webp`) rather than the CDN art,
because `cdn.m4t.tf` sends no `Access-Control-Allow-Origin` and WebGL
rejects non-CORS uploads: regenerate the crops whenever the still-life art
changes, compositing the six layers in z-order with ImageMagick and inverting
only the `dark:invert` layers over the dark background.

## Footer overlap contract

`src/components/Footer.astro` is in-flow (`static`) below 768px and a fixed
16px (`h-4`) overlay (`md:fixed md:bottom-0 md:h-4`) at desktop widths. On
mobile it is a two-column grid (`grid-cols-2`) with an `Explore` column
(`Blog`, `Photography`, `Graphics`, `Music`, `Vignettes` stacked) beside a
`Site` column (`About`, `Contact`, `Privacy` stacked), a `Resources` column
(`Developers`) wrapping onto the second row, and a right-aligned `Back to top`
button spanning both columns, for a total of roughly 390px. The `about`,
`contact` and `privacy` scroll-hero pages fill a `100svh` grid split 65:35
between the header and the top-aligned card row, and pad the card row with
`py-12` at desktop widths; keep that padding above the footer's height when
restyling. `developers` shares their mobile scroll-hero shell (a `150svh` hero,
then a top-bordered `bg-background` card sheet) while keeping its own desktop
grid. The shell uses the static small viewport units, not `dvh`, so collapsing
mobile browser chrome cannot reflow the page.
