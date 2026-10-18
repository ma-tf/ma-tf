# Pages

## Page component structure

- A page's presentational parts live in `src/features/{name}/`, with the page's
  components in `src/features/{name}/{name}.tsx`.
- `src/pages/{name}.astro` composes those components and holds no presentation
  of its own.
- A page component file exports `{Name}` (wrapper), `{Name}Header`,
  `{Name}Title`, `{Name}Description` and `{Name}Content`, plus any page-specific
  parts such as `{Name}Navigation`, `{Name}Grid` or `{Name}Card`. Omit parts a
  page does not need.
- A homepage preview card, where a page provides one, lives in a sibling
  `{name}-preview.tsx` and exports `{Name}Preview`.

## Clipped desktop layouts

A page whose desktop shell clips the viewport (`md:h-dvh md:overflow-hidden`)
scrolls an inner pane instead of the document, so wheel input over the rest of
the shell must be routed to that pane. The blog does this with
`startBlogScroll()` (`src/lib/blog-scroll.ts`): `data-blog-scroll` marks the
shell (`BlogPage`), `data-blog-scroll-target` the pane (`BlogContent`).
