# Conventions

CSS and styling conventions for this project.

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
