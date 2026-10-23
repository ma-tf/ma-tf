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

`about.astro`, `contact.astro` and `privacy.astro` also mark their card
`<section>` as a second frame (`scrollDistance: 2`, `scrollDrift: 0.1`), so the
card prose parallaxes on touch layouts. `StillLifeCard` renders its corner
brackets as a separate `data-parallax-mobile` layer, so the bracket frame and the
prose drift in opposite directions without disturbing the card's reveal
transform.

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
