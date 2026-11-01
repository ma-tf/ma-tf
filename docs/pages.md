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

## Chrome

The header and footer are one bar, top and bottom, each centring a `max-w-480`
row `h-4` tall with 12px icons. The footer draws a `border-border` hairline and
sits on `bg-background`; the header is transparent, has no bottom border, and
paints `topleftchrome` and `toprightchrome` as pseudo-element plates at its outer
corners, offset 8px up and 8px/7px outward. The header's icon cells and brand inset
`px-2`; the footer's cells use `px-4 md:px-3`. Cells rest at `text-muted-foreground`
and brighten to `text-foreground` on hover; the current page's cell already
rests there. Header controls instead use `dark:text-muted` and hover to
`dark:text-background`, so they stay dark against the chrome plates while their
hover animations still play. Where cells sit in a row they divide with
`border-l border-foreground/20`, which darkens to `dark:border-background/20` in
the header. The footer carries uppercase `text-2xs` labels
in its cells, the header icons only.

## Blog post content

`src/pages/posts/[...slug].astro` renders the MDX body through `PostContent`.
`remarkPostBirdBreak` inserts a `PostBirdBreak` component at the midpoint of the
post's top-level blocks, never beside a heading; the page maps that name to the
island through the MDX `components` prop. The bird sits inline between blocks
below `md`, and in the left gutter at `md` and up.

## CV PDF

`/cv` carries a scoped `@media print` block that hides the global header and
footer and clears the sheet's viewport-height floor and padding, so print output
starts at the content. `vp run generate:cv-pdf` starts a dev server, opens `/cv`
in headless Chromium under print emulation and writes an A4 PDF with 16mm
margins and print backgrounds to `public/cv.pdf`. Rendering the page never calls
the ask service, so the generator supplies placeholder ask keys when they are
absent. The file is generated rather than committed: `vp run dev` and `vp run
build` regenerate it, and Chromium must be installed locally with `vpx
playwright install chromium`. CI installs it with `vpx playwright install
--with-deps chromium`.

## Clipped desktop layouts

A page whose desktop shell clips the viewport (`md:h-dvh md:overflow-hidden`)
scrolls an inner pane instead of the document, so wheel input over the rest of
the shell must be routed to that pane. The blog does this with
`startBlogScroll()` (`src/lib/blog-scroll.ts`): `data-blog-scroll` marks the
shell (`BlogPage`), `data-blog-scroll-target` the pane (`BlogContent`).
