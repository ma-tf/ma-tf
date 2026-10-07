# Conventions

Conventions for this project.

## Page component structure

- A page's presentational parts live in `src/features/{name}/`, with the page's
  components in `src/features/{name}/{name}.tsx`.
- `src/pages/{name}.astro` composes those components and holds no presentation
  of its own.
- A page component file exports `{Name}` (wrapper), `{Name}Header`,
  `{Name}Title`, `{Name}Description` and `{Name}Content`, plus any page-specific
  parts such as `{Name}Navigation`, `{Name}Grid` or `{Name}Card`. Omit parts a
  page does not need.
- A homepage preview card lives in a sibling `{name}-preview.tsx` and exports
  `{Name}Preview`.

## Styling

- **Tailwind v4 utility-first.** Style components with utility classes. Global
  styles (theme tokens, custom utilities) live in `src/styles/global.css` via
  `@theme` and `@utility`.
- **Use design tokens, not raw colours.** Reference the theme tokens defined in
  `global.css` (`text-foreground`, `bg-muted`, `border-border`,
  `text-muted-foreground`, etc.) rather than hardcoded hex/oklch values.
- **Compose classes with `cn()`** (the `cn` package) for conditional class
  strings.

## Responsive variants

- **Write mobile-first.** Write the base (small-screen) layout first and layer
  `md:` (and up) variants over it, rather than writing the desktop layout and
  undoing it with `max-md:`. `max-md:` is not allowed; the linter enforces this
  with `tailwind/no-max-md` (configured in
  [`vite.config.ts`](../vite.config.ts)).

## Arbitrary values

- **The linter allowlists arbitrary values.** `shadcn/no-arbitrary-values`
  (configured in [`vite.config.ts`](../vite.config.ts)) permits only
  `transition-*`, `origin-*`, and `grid-rows-*`; anything else, such as
  `scale-[2]` or `h-[200dvh]`, fails `vp check`. Extend the `allow` list only
  when a value has no token or utility alternative. `src/components/ui/**` is
  exempt.
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

Never use `transition-all`: it animates every changed property, including
expensive layout properties and instant ones such as focus rings. Name the
properties being animated with `transition-colors`, `transition-opacity` or
`transition-transform`, or an arbitrary value such as
`transition-[opacity_200ms,transform_200ms]`. The
`react-doctor/no-transition-all` rule (warning) enforces this.

## Motion

- **Entrances reuse the shared utilities**, not ad-hoc keyframes.
  `animate-fade-up` (+ `animation-delay-*`) reveals above-the-fold content on
  page load; `animate-reveal` (optional `-<ms>`, default 300) fades content in
  once it scrolls ~15% into view.
- **Theme changes sweep** through the View Transitions API. See
  [ADR 010](adr/010-theme-transitions-via-view-transitions.md).
- **Keep motion snappy:** time-based transitions run for at most 150ms, and
  staggered delays sit 50ms apart. Scroll reveals declare an optional duration
  (`animate-reveal-<ms>`, default 300ms). See
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

## Language

- Use British English for documentation, UI copy and code comments. Technical
  terms and API names keep their original spelling (for example CSS `color`).

## Icons

- Import Phosphor icons with the `Icon` postfix (`ArrowLeftIcon`, `SunIcon`).
  The bare name (`ArrowLeft`) is a deprecated alias and must not be used in new
  code.
