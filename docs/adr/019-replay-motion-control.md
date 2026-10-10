# ADR 019: One Motion Control for Skip, Replay and Revisit

## Context

Entrance motion is gated only by the operating system's
`prefers-reduced-motion` preference. A visitor who wants a particular page to
settle quickly, or who dislikes the page-load reveal, cannot ask for that
without changing an OS setting that applies to every application. Delays are
staggered up to roughly 1.2s, and on `/developers` a scripted typewriter reveals
a paragraph after a 4.1s delay, so an entrance can run for several seconds.

The entrances also replay on every MPA navigation, including returning to a page
already opened in the same tab, so a visitor who moves back and forth re-watches
the same reveal each time.

The control that ends or replays that motion has to exist for the whole
entrance. The entrance animations are plain CSS that start at first paint, so a
control rendered only on the client, or one that waits on React hydration, would
arrive after the motion it is meant to govern.

## Decision

A single control lives in the header's fixed cluster beside the theme toggle:
the server-rendered `src/components/MotionControlButton.astro` plus the
imperative `src/lib/motion-control.ts`, run from the component's `<script>` — a
deferred module, so far earlier than React hydration. The control has three
states:

- **skip** — shown while the page-load entrance is running. A press sets
  `data-motion="skipped"` on `<html>` and completes the `/developers` typewriter
  at once.
- **reset** — shown once the entrance finishes, or immediately on a page that
  already carries a `data-motion` value. A press removes the current pathname
  from `sessionStorage["visited-pages"]` and reloads, so the refreshed load
  records the visit again and replays the entrance.
- **hidden** — when `prefers-reduced-motion: reduce` is set, or when the page
  has no entrance to skip or replay (`animate-fade-up-*`, `animate-fade-in`, or
  `[data-typewriter]`).

A pre-paint inline script in `Layout.astro` records visited pathnames in
`sessionStorage` under `visited-pages`. If the current pathname is already
recorded it sets `data-motion="revisit"` on `<html>` before the body is parsed,
and records the pathname otherwise. The value is scoped to the tab session, so a
new tab replays the entrance once.

`global.css` disables the page-load entrance utilities (`animate-fade-up-*`,
`animate-fade-in`) while `data-motion` carries either value, and disables the
scroll-driven reveals (`animate-fade-in-scroll`, `animate-reveal`) and the
typewriter only for `skipped`. A revisit therefore skips the motion that runs on
load, while the scroll reveals — which respond to the reader's own scrolling
rather than costing time at load — still play. `startTypewriter` declines to run
while any `data-motion` value is present. The reduced-motion off-switches in
`global.css` are kept and the attribute rules are added alongside them, so
visitors whose OS already reduces motion are covered without JavaScript and
without a flash.

Scope is limited to entrances and reveals. The theme sweep
([ADR 010](010-theme-transitions-via-view-transitions.md)), pointer parallax and
the tag orbit keep their own reduced-motion handling and are not affected by the
control.

Reset performs a full document reload because the site is an MPA and the
entrance decision is made before paint by the inline script in `Layout.astro`;
the reset only has to clear the stored visit so that script sees a first visit
on the next load.

The two Phosphor icons are imported from `@phosphor-icons/react/ssr`, so the
component renders static SVG server-side with no React client runtime. The icon
crossfade is CSS in `global.css`, keyed on `[data-motion-control][data-mode]`
with a `html[data-motion]` branch, so neither the revisit nor the reduced-motion
case flashes the skip icon. `src/hooks/use-motion-control.ts` is deleted;
`src/hooks/use-reduced-motion.ts` stays, because the tag orbit uses it.

## Consequences

### Positive

- A visitor can end an entrance, and replay one they skipped or a revisit
  suppressed, without opening a new tab, and the skip affordance no longer
  vanishes at the moment it might be wanted.
- Entrances play once per page per tab without a visitor pressing anything, then
  the control remains as a reset affordance.
- The control ships as static HTML plus a small module, deciding skip/reset from
  the same pre-paint script that already decides the entrance, with no React in
  the header.
- Reuses the `data-motion` vocabulary, the `visited-pages` store, and the
  existing entrance selectors.

### Negative

- Reset is a full document reload, which is heavier than an in-place replay would
  be.
- The control persists in the header on any page with an entrance, so the header
  carries a standing affordance rather than a transient one.
- Returning to a page within a tab shows no entrance motion at all; content
  appears immediately, which can read as abrupt.
- Behaviour is per tab, so a new tab replays once.
- A new entrance utility must be added both to the entrance rule and to the
  reduced-motion off-switches in `global.css`.
- The `visited-pages` key and pathname normalisation are read by the inline
  script and written by the component, so a change must be made in both places.
- The port from the React hook drops its effect cleanup (`clearTimeout`,
  `removeEventListener`, `running.clear()`) on purpose: the deferred script runs
  once per document, the `started` guard makes repeat calls a no-op, and the
  fallback timeout and typewriter listeners die with the document on full
  navigation.
- The auto-hide sampling and 5s fallback remain best-effort, and the control
  cannot shorten the entrance itself; on a fast machine the entrance remains the
  gate.

## Applied To

- `src/components/MotionControlButton.astro`
- `src/lib/motion-control.ts`
- `src/lib/typewriter.ts`
- `src/components/Header.astro`
- `src/styles/global.css`
- `src/layouts/Layout.astro`
