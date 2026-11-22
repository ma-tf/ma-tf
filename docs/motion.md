# Motion

`src/lib/parallax.ts` turns `data-parallax*` attributes into transforms, and
`src/styles/global.css` defines the entrance and scroll-reveal utilities. This
page covers the drivers; the attributes, utilities and call-site contracts each
have their own file, listed at the end. For the timing rules see
[ADR 011](adr/011-motion-timing-budget.md); for the
skip, replay and revisit control see
[ADR 019](adr/019-replay-motion-control.md).

## Drivers

Three independent drivers run on the homepage. Two are started once by
`startParallax()` from `Layout.astro`, and each disables itself when its
breakpoint or motion condition stops holding.

| Driver  | Runs when     | Reads input | Moves                                                                                              |
| ------- | ------------- | ----------- | -------------------------------------------------------------------------------------------------- |
| Pointer | width ≥ 768px | `mousemove` | every `[data-parallax]` layer in `document`                                                        |
| Scroll  | width ≤ 767px | `scroll`    | `[data-parallax*]` layers inside every `[data-parallax-scroll]` frame, plus `[data-parallax-push]` |
| Sphere  | always        | `rAF` clock | every `svg[data-sphere-grid]` path `d`; axial spin one turn per 960s plus camera sway at 15fps     |

- The breakpoint is `(max-width: 767px)`; the pointer driver is the inverse.
- All three drivers stand down while `(prefers-reduced-motion: reduce)` matches.
- The pointer driver eases toward the cursor; the scroll driver is written
  directly. The sphere driver re-projects the wireframe each frame, so rotation
  changes the projection itself; like the parallax drivers it is not gated by
  `data-motion`.
- While a driver is animating it adds `parallax-active` to `<html>`, which turns
  on `will-change: transform` for parallax layers.

The drivers match the same attributes but different scopes: the pointer driver
matches `[data-parallax], [data-parallax-x], [data-parallax-y]` anywhere in the
document, while the scroll driver matches them only inside a
`[data-parallax-scroll]` frame. Page content that carries `data-parallax`
outside a scroll frame (such as the still-life page headers) moves on desktop
and stays still on mobile.

Each frame is independent: the driver reads `data-parallax-scroll-distance`,
`-drift` and `-scale` off the frame itself and builds a separate animator, so a
frame can tune its own travel and overscan. The still-life pages use two frames —
the background (`scale: 1.15`) and the card section (`scale: 1`, so the text is
not scaled).

## Fragment loop

`startHomeFragments()` (`src/lib/home-fragments.ts`) runs only where the homepage
layer exists. It places up to three `[data-home-fragment]` blocks at seeded
positions clear of every `[data-fragments-avoid]` element, types the first in at
load, follows with the next two six seconds apart, then retires the oldest every
six seconds as a replacement types in. Typing reuses the typewriter's character
spans and interval (`src/lib/typewriter.ts`) at the hero's pace, without a caret
and without the motion-control events.

Hovering or focusing a section title (`[data-title][data-wash]`) clears the
layer and grows the fragments tagged with that title's wash
(`data-fragment-topic`) one every two seconds until three are visible, then
retires the oldest and brings in the next unseen fragment every two seconds,
so the rotation keeps turning up new copy. A title with no spare fragment
re-types its three in place; leaving restarts the seeded loop.

The loop is continuous decorative motion: exempt from the 150ms budget of
[ADR 011](adr/011-motion-timing-budget.md) and not governed by the motion
control. `prefers-reduced-motion` shows placed blocks whole, without typing or
the loop, and a hovered title's fragments all at once. A `ResizeObserver`
refreshes the reserved boxes when an obstacle grows; window resizes keep the
visible count. Fragments follow a gentler 2000px curve, tilting up to 12°.

## Theme transitions

Theme changes sweep through the View Transitions API. See
[ADR 010](adr/010-theme-transitions-via-view-transitions.md).

## Also in this topic

- [Motion attributes](motion-attributes.md) — every `data-parallax*` attribute, its driver and default.
- [Still life background](motion-background.md) — the six-layer still life and the footer overlap contract.
- [Reduced motion and the motion control](motion-control.md) — the `prefers-reduced-motion` and `data-motion` gates.
- [Animated icons](motion-icons.md) — the hand-animated Phosphor icons.
- [Reveal trigger](motion-reveal.md) — how `animate-reveal-*` observes and reveals.
- [CSS animation utilities](motion-utilities.md) — entrances, reveals and the delay tokens.
- [CSS layout and driver state utilities](motion-layout-utilities.md) — layout utilities and `parallax-active`.
