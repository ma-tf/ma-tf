# Conventions

Styling conventions for this project.

## Styling

- **Tailwind v4 utility-first.** Style components with utility classes. Global
  styles (theme tokens, custom utilities) live in `src/styles/global.css` via
  `@theme` and `@utility`.
- **Use design tokens, not raw colours.** Reference the theme tokens defined in
  `global.css` (`text-foreground`, `bg-muted`, `border-border`,
  `text-muted-foreground`, etc.) rather than hardcoded hex/oklch values.
- **Compose classes with `cn()`** (`clsx` + `tailwind-merge`) for conditional
  class strings.

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
