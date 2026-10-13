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

## Links

- **Use the `Link` component** from
  [`src/components/link.tsx`](../src/components/link.tsx) for anchors that sit
  in content. It renders an `<a>` with the shared treatment: no underline, the
  steel accent at rest, and a brighter steel on hover.
- **Links are steel, and brighten on hover.** Light mode rests at
  `text-steel-600` and hovers to `text-steel-400`; dark mode rests at
  `text-steel-400` and hovers to `text-steel-200`. Dark mode needs its own pair
  because the light rest value is too dark against the dark background. The CV
  uses the same pairs on its contact and project links.
- **Links are unadorned.** No underline, at rest or on hover — the colour
  carries the affordance, which is why links sit in steel rather than at body
  colour. The shadcn primitives in `src/components/ui/**` keep their own
  treatments.
- **Markdown inside a hydrated island needs the variant form.** Markdown links
  cannot take the `Link` component when the content is rendered as a child of a
  client island, so the FAQ answers style theirs from the wrapper with
  `[&_a]:text-steel-600 [&_a]:no-underline [&_a]:hover:text-steel-400
  dark:[&_a]:text-steel-400 dark:[&_a]:hover:text-steel-200` (see
  [`faq-row.tsx`](../src/features/faq/faq-row.tsx)).
- **The navigate-away icon is placed at the call site.** Links that leave the
  sentence (the about, contact and privacy prose links) render
  `ArrowSquareOutIcon` as a child of `Link`, with the anchor carrying
  `className="inline-flex items-center gap-1"`; the mailto link takes neither.
  Keep the label a single capitalised word (`CV`, `Contact`, `GitHub`) and leave
  surrounding words such as "page" outside the anchor.
- **Section titles override to body colour.** Homepage section titles read as
  headings, not links, so `SectionTitle` overrides the accent with
  `text-foreground hover:text-foreground/70`. Overriding only the base colour is
  not enough — `Link`'s `dark:` pair carries the same specificity, so the
  override needs the `dark:` pair too.

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
