# Conventions

Styling conventions for this project.

## Styling

- **Tailwind v4 utility-first.** Style components with utility classes. Global
  styles (theme tokens, custom utilities) live in `src/styles/global.css` via
  `@theme` and `@utility`.
- **Use design tokens, not raw colours.** Reference the theme tokens defined in
  `global.css` (`text-foreground`, `bg-muted`, `border-border`,
  `text-muted-foreground`, etc.) rather than hardcoded hex/oklch values.
- **Compose classes with `cn()`** (the `cn` package) for conditional class
  strings.

## Arbitrary values

- Math functions in arbitrary values do not need underscores. Tailwind v4
  normalises operators, so `w-[calc(100%-2rem)]` compiles to
  `width: calc(100% - 2rem)`.
- Use arbitrary properties (`[property:value]`) for CSS that has no Tailwind
  utility, e.g. `[clip-path:...]` or `[filter:...]`.

## clip-path

`clip-path` clips the element's own border, outline, box-shadow, and filter. To
draw a shadow or outline that follows a clipped shape, apply
`filter: drop-shadow(...)` to an unclipped parent (wrapper) element instead.

## Transitions

Never use `transition-all` — name the specific properties. See
[ADR 003](adr/003-no-transition-all.md).

## Motion

- **Entrances reuse the shared utilities**, not ad-hoc keyframes.
  `animate-fade-up` (+ `animation-delay-*`) reveals above-the-fold content on
  page load; `animate-reveal` reveals content as it scrolls into view. Stagger
  scroll-revealed siblings with an inline `--reveal-offset`.
- **Theme changes sweep** through the View Transitions API. See
  [ADR 010](adr/010-theme-transitions-via-view-transitions.md).
- **Keep motion snappy:** time-based transitions run for at most 150ms, and
  staggered delays sit 50ms apart. See
  [ADR 011](adr/011-motion-timing-budget.md).
- Every entrance utility is disabled under `prefers-reduced-motion: reduce`.
- **A motion control** skips or replays the current page's entrances. The header
  button ends a running entrance by setting `data-motion="skipped"` on `<html>`
  (which disables those utilities for that page view only and completes the
  `/developers` typewriter at once), then becomes a reset control that forgets
  the page's `visited-pages` entry and reloads to replay it. See
  [ADR 019](adr/019-replay-motion-control.md).
- **Revisits skip entrances.** A path already recorded in `sessionStorage`
  (`visited-pages`) sets `data-motion="revisit"` before paint, disabling the
  page-load entrances while leaving scroll reveals running. See
  [ADR 018](adr/018-revisit-entrance-skip.md).
