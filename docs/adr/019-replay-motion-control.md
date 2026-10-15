# ADR 019: One Motion Control for Skip, Replay and Revisit

## Context

Entrance motion is gated only by the operating system's
`prefers-reduced-motion` preference, which cannot be changed for one page alone.
Delays stagger up to roughly 1.2s, and on `/developers` a typewriter reveals a
paragraph after 4.1s, so an entrance can run for several seconds.

They also replay on every MPA navigation, including a return to a page already
open in the tab, so moving back and forth re-watches the same reveal.

The control must exist for the whole entrance: the animations are plain CSS that
start at first paint, so a client-only control, or one that waits on React
hydration, would arrive after the motion it governs.

## Decision

A single control lives in the header's fixed cluster beside the theme toggle:
the server-rendered `src/components/MotionControlButton.astro` plus the
imperative `src/lib/motion-control.ts`, run from the component's `<script>`, a
deferred module that runs before React hydration. The control has three states:

- **skip** — shown while the page-load entrance is running. A press sets
  `data-motion="skipped"` on `<html>` and completes the `/developers` typewriter
  at once.
- **reset** — shown once the entrance finishes, or immediately on a page that
  already carries a `data-motion` value. A press removes the current pathname
  from `sessionStorage["visited-pages"]` and reloads, so the refresh replays the
  entrance.
- **hidden** — when `prefers-reduced-motion: reduce` is set, or when the page
  has no entrance to skip or replay (`animate-fade-up-*`, `animate-fade-in`, or
  `[data-typewriter]`).

A pre-paint inline script in `Layout.astro` records visited pathnames in
`sessionStorage` under `visited-pages`, setting `data-motion="revisit"` on
`<html>` before the body is parsed when the pathname is already recorded. The
store is scoped to the tab session, so a new tab replays the entrance once.

`global.css` disables the page-load entrances (`animate-fade-up-*`,
`animate-fade-in`) while `data-motion` carries either value, and disables the
scroll reveals (`animate-fade-in-scroll`, `animate-reveal`) and the typewriter
only for `skipped`: a revisit skips the load motion while the reveals, which
respond to the reader's own scrolling, still play. `startTypewriter` declines
while any `data-motion` value is present. The reduced-motion off-switches stay,
so a visitor whose OS reduces motion is covered without JavaScript.

Scope is limited to entrances and reveals: the theme sweep
([ADR 010](010-theme-transitions-via-view-transitions.md)), pointer parallax and
the tag orbit keep their own reduced-motion handling.

Reset reloads rather than replaying in place because the entrance decision is
made before paint by `Layout.astro`'s inline script.

The two Phosphor icons come from `@phosphor-icons/react/ssr`, so the component
renders static SVG with no React client runtime, and the crossfade is CSS in
`global.css` keyed on `[data-motion-control][data-mode]` with an
`html[data-motion]` branch, so no case flashes the skip icon.
`src/hooks/use-motion-control.ts` is deleted; `use-reduced-motion.ts` stays for
the tag orbit.

## Consequences

### Positive

- A visitor can end an entrance, and replay one they skipped or a revisit
  suppressed, without opening a new tab, and the skip affordance no longer
  vanishes just when it is wanted.
- Entrances play once per page per tab without a visitor pressing anything, then
  the control remains as a reset affordance.
- The control is static HTML plus a small module, deciding skip/reset from the
  same pre-paint script that decides the entrance, with no React in the header,
  and reusing the `data-motion` vocabulary, the `visited-pages` store and the
  existing entrance selectors.

### Negative

- Reset is a full document reload, which is heavier than an in-place replay would
  be.
- The control persists in the header on any page with an entrance, so the
  affordance is standing rather than transient, and a return within the tab shows
  no entrance at all — content appears immediately, which can read as abrupt.
- Behaviour is per tab, so a new tab replays once.
- A new entrance utility must be added to both the entrance rule and the
  reduced-motion off-switches in `global.css`, and the `visited-pages` key and
  pathname normalisation are written by the component but read by the inline
  script — two places for each.
- The port from the React hook drops its effect cleanup on purpose: the deferred
  script runs once per document and `started` makes repeat calls a no-op.
- The auto-hide sampling and 5s fallback are best-effort, and the control cannot
  shorten the entrance itself.

## Applied To

- `src/components/MotionControlButton.astro`
- `src/lib/motion-control.ts`
- `src/lib/typewriter.ts`
- `src/components/Header.astro`
- `src/styles/global.css`
- `src/layouts/Layout.astro`
