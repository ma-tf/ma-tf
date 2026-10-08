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
