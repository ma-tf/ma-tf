# ADR 011: Motion Timing Budget

## Context

Motion durations had drifted apart: hover transitions ran at 150–200ms, page-load
entrances at 300ms, the theme sweep at 500ms, and the accordion at its library's
200ms default. Unrelated interactions therefore felt like they belonged to
different interfaces, and the longer values made the site feel sluggish.

## Decision

- Any time-based transition or entrance animation runs for at most **150ms**.
- Staggered entrances space their delays **50ms** apart (0, 50, 100, …).
- Exempt from the budget: scroll-driven animations, whose progress maps to
  scroll position rather than time (`animate-reveal`, `animate-fade-in-scroll`),
  and continuous decorative loops (`animate-icon-crossfade`, `animate-spin`,
  `caret-blink`).

## Consequences

### Positive

- Every interaction settles on the same short beat, so the interface feels
  snappy and internally consistent.
- Staggers stay readable: a group of four items finishes within 150ms of motion
  plus 150ms of delay.

### Negative

- The theme sweep at 150ms is a quick wipe rather than a slow reveal. If it
  reads as a flicker, it is the one candidate to exempt from this budget.
- Library animations must be capped explicitly where their default exceeds
  150ms (for example `animate-accordion-down`, which defaults to 200ms).

## Applied To

- `src/styles/global.css`
- `src/features/blog/blog-page.tsx`
- `src/components/ui/accordion.tsx`
- `src/features/vignettes/vignette-thumbnail.tsx`
- Page-load entrance delays across `src/pages/` and `src/features/`
