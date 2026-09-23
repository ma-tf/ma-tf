# ADR 010: Theme Changes Use the View Transitions API

## Context

Toggling the theme swapped the `.dark` class on `<html>`, so every colour on the
page changed in a single frame. We wanted the new theme to sweep across the
viewport, with text colours changing as the sweep passes, rather than snapping.

Two mechanisms were considered:

- Registering the theme custom properties (`--background`, `--foreground`, …) as
  `@property` and transitioning them on `:root`. This produces a smooth colour
  morph with universal support, but it is a fade, not a sweep, and requires
  registering every token.
- The same-document View Transitions API (`document.startViewTransition`), which
  snapshots the before and after states and animates between them. The default
  animation is a crossfade, but the incoming snapshot can be revealed with any
  CSS animation.

## Decision

`toggleTheme` in `src/stores/theme.ts` performs its DOM mutation inside
`document.startViewTransition` when the browser supports the API and the user
does not prefer reduced motion. Otherwise it applies the mutation directly, so
the theme still changes instantly.

`global.css` replaces the default crossfade: the old snapshot stays in place
underneath and the new snapshot is revealed with a `clip-path` wipe over 150ms
using the `--ease-in-out-quart` token. See
[ADR 011](011-motion-timing-budget.md) for the timing budget this follows.

## Consequences

### Positive

- One mechanism produces both the background sweep and the text colour change;
  no per-element transitions and no `@property` registrations.
- Browsers without the API, and users who prefer reduced motion, get the same
  theme change without the animation.

### Negative

- The page is rasterised for the duration of the transition, so anything running
  at that moment (video, parallax, looping icon animations) freezes for ~150ms.
- The sweep is short enough to read as a quick wipe rather than a slow reveal.
  If that proves too fast to follow, it is the one animation worth exempting
  from the timing budget in [ADR 011](011-motion-timing-budget.md).
- The sweep is a browser dependency: same-document View Transitions are
  supported in Chrome 111+, Safari 18+, and Firefox 144+.

## Applied To

- `src/stores/theme.ts`
- `src/styles/global.css`
