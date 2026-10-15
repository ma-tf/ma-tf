# Motion

`src/lib/parallax.ts` turns `data-parallax*` attributes into transforms, and
`src/styles/global.css` defines the entrance and scroll-reveal utilities. This
page covers the drivers; the attributes, utilities and call-site contracts each
have their own file, listed at the end. For the timing rules see
[ADR 011](adr/011-motion-timing-budget.md); for the
skip, replay and revisit control see
[ADR 019](adr/019-replay-motion-control.md).

## Drivers

Two independent drivers are started once by `startParallax()` from
`Layout.astro`, and each disables itself when its breakpoint or motion condition
stops holding.

| Driver  | Runs when     | Reads input | Moves                                                                                              |
| ------- | ------------- | ----------- | -------------------------------------------------------------------------------------------------- |
| Pointer | width ≥ 768px | `mousemove` | every `[data-parallax]` layer in `document`                                                        |
| Scroll  | width ≤ 767px | `scroll`    | `[data-parallax*]` layers inside every `[data-parallax-scroll]` frame, plus `[data-parallax-push]` |

- The breakpoint is `(max-width: 767px)`; the pointer driver is the inverse.
- Both drivers stand down while `(prefers-reduced-motion: reduce)` matches.
- The pointer driver eases toward the cursor; the scroll driver is written
  directly.
- While a driver is animating it adds `parallax-active` to `<html>`, which turns
  on `will-change: transform` for parallax layers.

The two selectors are not the same set. The pointer driver matches
`[data-parallax], [data-parallax-x], [data-parallax-y]` anywhere in the document.
The scroll driver matches only descendants of a `[data-parallax-scroll]` frame,
plus the scroll-only `data-parallax-mobile*` names, so page content that carries
`data-parallax` outside a scroll frame (such as the still-life page headers)
moves on desktop and stays still on mobile.

Each frame is independent: the driver reads `data-parallax-scroll-distance`,
`-drift` and `-scale` off the frame itself and builds a separate animator, so a
frame can tune its own travel and overscan. The still-life pages use two frames —
the background (`scale: 1.15`) and the card section (`scale: 1`, so the text is
not scaled).

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
