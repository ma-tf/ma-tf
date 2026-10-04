# ADR 018: Revisits Skip Entrance Motion

## Context

[ADR 017](017-motion-skip-control.md) adds a one-shot control for ending the
entrance motion of the current page view, but the entrance animations still
replay on every MPA navigation — including returning to a page the visitor has
already opened in the same tab. A visitor who moves back and forth between the
home page and a section re-watches the same reveal each time.

## Decision

Record visited pathnames in `sessionStorage` under `visited-pages`. A pre-paint
inline script in `Layout.astro` runs before the body is parsed: if the current
pathname is already recorded it sets `data-motion="revisit"` on `<html>`, and it
records the pathname otherwise. The value is scoped to the tab session, so a new
tab replays the entrance once.

`global.css` disables the page-load entrance utilities (`animate-fade-up-*`,
`animate-fade-in`) while `data-motion` is `revisit`, and keeps disabling the
scroll-driven reveals (`animate-fade-in-scroll`, `animate-reveal`) only for the
`skipped` value from [ADR 017](017-motion-skip-control.md). Revisits therefore
skip the motion that runs on load, while scroll reveals — which respond to the
reader's own scrolling rather than costing time at load — still play.

`startTypewriter` in `src/lib/typewriter.ts` declines to run while a motion-skip
value is present, so the scripted entrance on `/developers` renders its text at
once on a revisit. `MotionSkipButton` treats any skip value as already skipped,
so it does not appear on a page whose entrance is suppressed.

If storage is unavailable the visit is not recorded and the entrance plays
normally. `prefers-reduced-motion` continues to disable the entrances outright.

## Consequences

### Positive

- Entrances play once per page per tab, then the page opens without replayed
  motion, without a visitor having to press anything.
- Scroll reveals are preserved, unlike the manual skip in ADR 017, because they
  do not delay the page.
- The behavior reuses the `data-motion` vocabulary and the pre-paint class
  pattern already used for theme flash prevention.

### Negative

- Returning to a page within a tab shows no entrance motion at all; content
  appears immediately, which can read as abrupt.
- Behavior is per tab, so a new tab replays once.
- bfcache already skips replay on back and forward, so the change mainly affects
  repeat forward navigation.
- The entrance selectors are now shared by two attribute values, so a new
  entrance utility must be added to the entrance rule in `global.css`.

## Applied To

- `src/layouts/Layout.astro`
- `src/styles/global.css`
- `src/lib/typewriter.ts`
- `src/components/MotionSkipButton.tsx`
