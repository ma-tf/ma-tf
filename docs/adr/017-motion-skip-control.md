# ADR 017: One-Shot Skip for Entrance Motion

## Context

Entrance motion is gated only by the operating system's
`prefers-reduced-motion` preference. A visitor who wants a particular page to
settle quickly, or who dislikes the page-load reveal, cannot ask for that
without changing an OS setting that applies to every application.

The entrance utilities (`animate-fade-up-*`, `animate-fade-in`) and the
scroll-driven reveals (`animate-reveal`, `animate-fade-in-scroll`) already
disable themselves under `prefers-reduced-motion`. Delays are staggered up to
roughly 1.2s, and on `/developers` a scripted typewriter reveals a paragraph
after a 4.1s delay, so an entrance can run for several seconds.

## Decision

The theme toggle gains a sibling, `MotionSkipButton`, in a shared fixed cluster
in `Header.astro`. Pressing it sets `data-motion="skipped"` on `<html>`;
`global.css` disables the four entrance and reveal utilities while that
attribute is present. The flag is not persisted, so the next navigation (the
site is an MPA) restores the entrances.

The control is one-shot rather than a persisted preference. It exists to end the
entrance currently playing, not to record a standing choice; a standing choice
is what `prefers-reduced-motion` is for. The button hides itself once pressed, or
once every entrance animation on the page has finished, and appears only when
there is an unfinished entrance to skip.

Scope is limited to entrances and reveals. The theme sweep
([ADR 010](010-theme-transitions-via-view-transitions.md)), pointer parallax and
the tag orbit keep their own reduced-motion handling and are not affected by the
flag.

The scripted typewriter on `/developers` is treated as an entrance. Its module,
`src/lib/typewriter.ts`, announces itself with `typewriter:start` and
`typewriter:end` events and exposes a `finishTypewriter` control, so the button
stays until the typing finishes and a press completes the text at once.

The reduced-motion off-switches in `global.css` are kept and the attribute rule
is added alongside them, so visitors whose OS already reduces motion are covered
without JavaScript and without a flash.

## Consequences

### Positive

- A visitor can end an entrance, and the scroll reveals on that page view, with
  one press.
- The button is self-clearing: it is absent once entrances have finished, so it
  never becomes a dead affordance.
- OS reduced-motion visitors see no change and no flash; the media queries still
  own that case.

### Negative

- A second off-switch duplicates the reduced-motion selectors, so a new entrance
  utility must be added to both places.
- Once pressed, reveals that have not been scrolled to are also disabled for that
  page view, with no undo short of navigating.
- The auto-hide samples running animations once at mount; a scripted entrance
  that does not emit the typewriter events would not extend the window.
- On a page whose entrances are short, the button is visible only briefly.

## Applied To

- `src/components/MotionSkipButton.tsx`
- `src/components/ModeToggle.tsx`
- `src/components/Header.astro`
- `src/lib/typewriter.ts`
- `src/styles/global.css`
