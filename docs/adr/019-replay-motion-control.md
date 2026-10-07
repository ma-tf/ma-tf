# ADR 019: Replay Control Replaces the One-Shot Motion Skip

## Context

[ADR 017](017-motion-skip-control.md) adds a control that ends the current page's
entrance motion and then hides once pressed or once the entrance finishes.
[ADR 018](018-revisit-entrance-skip.md) suppresses the entrance entirely for a
path already opened in the tab. Together they make an entrance hard to see on
purpose: once it finishes, a visitor has no way to ask for it again without
closing the tab, and a revisit hides the control exactly when the missing motion
is noticed.

## Decision

`MotionSkipButton` is renamed `MotionControlButton` and gains a second mode. It
has three states:

- **skip** — shown while the page-load entrance is running. A press sets
  `data-motion="skipped"` on `<html>` and completes the `/developers` typewriter
  at once, as in [ADR 017](017-motion-skip-control.md).
- **reset** — shown once the entrance finishes, or immediately on a page that
  already carries a `data-motion` value from
  [ADR 018](018-revisit-entrance-skip.md). A press removes the current pathname
  from `sessionStorage["visited-pages"]` and reloads, so the refreshed load
  records the visit again and replays the entrance.
- **hidden** — when `prefers-reduced-motion: reduce` is set, or when the page
  has no entrance to skip or replay (`animate-fade-up-*`, `animate-fade-in`, or
  `[data-typewriter]`).

The button still server-renders its skip state, so it is present for the whole
entrance before hydration, matching [ADR 017](017-motion-skip-control.md).

Reset performs a full document reload because the site is an MPA and the
entrance decision is made before paint by the inline script in `Layout.astro`;
the reset only has to clear the stored visit so that script sees a first visit
on the next load.

## Consequences

### Positive

- A visitor can replay an entrance they skipped, or one a revisit suppressed,
  without opening a new tab.
- One control covers ending the entrance and seeing it again; the skip affordance
  no longer vanishes at the moment it might be wanted.
- Reuses the `data-motion` vocabulary, the `visited-pages` store from
  [ADR 018](018-revisit-entrance-skip.md), and the existing entrance selectors.

### Negative

- The reset control persists in the header on any page with an entrance, so the
  header now carries a standing affordance rather than a transient one.
- Reset is a full document reload, which is heavier than an in-place replay would
  be.
- The `visited-pages` key and pathname normalization are now read by the inline
  script and written by the component, so a change must be made in both places.
- The button server-renders the skip state, so a reduced-motion or revisit page
  can show the skip icon briefly before hydration corrects it.

## Applied To

- `src/components/MotionControlButton.astro`
- `src/lib/motion-control.ts`
- `src/components/Header.astro`
- `src/layouts/Layout.astro`
- `src/lib/typewriter.ts`

> Amended by [ADR 022](022-motion-control-runs-before-hydration.md): the control
> is a server-rendered `.astro` component driven by `src/lib/motion-control.ts`,
> not a hydrated React island, so it no longer waits on hydration and the
> revisit skip-icon flash is gone.
