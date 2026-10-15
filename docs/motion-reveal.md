# Reveal trigger

`animate-reveal-<ms>` is not scroll-driven. `startReveal()` in
`src/lib/reveal.ts` observes every `[class*="animate-reveal"]` element with
`IntersectionObserver`, using a root expanded 10% past the viewport bottom and a
`0.4` threshold, so an element reveals once 40% of it is in view; it then
adds `is-revealed` so a transition of the declared duration fades it in. The
hidden state is scoped to
`@media (scripting: enabled)`, so without scripting, or under reduced motion, the
elements stay visible with no flash. `data-motion="skipped"` forces them visible.
The prose components in `src/components/prose.tsx` put `animate-reveal` on each
paragraph, heading, list, blockquote, code block and table, so blog posts reveal
per block rather than as one wrapper. The photography description
(`src/features/photography/photography-page.tsx`) follows the same rule at its
call site, putting `animate-reveal` on each paragraph and on the list rather than
on the description wrapper. The photography grid items
(`src/features/photography/photography-column.astro`) carry `md:animate-reveal`
on a static wrapper around the `PhotographyDialog` island, so the `is-revealed`
class the reveal adds at load stays out of React's hydrated tree and does not
cause a hydration mismatch; it is held to `md:` to match the desktop-only grid
parallax. A `.post-content` guard cancels the hidden
state on nested blocks so a paragraph inside a blockquote does not fade twice, and
an `.answer-content` override forces the FAQ answers visible, because they mount
after `startReveal()` has run and would never be observed.
The still-life and developers cards keep the reveal mobile-only: their desktop
layout fits the viewport, so the observer would fire the moment it observes them
rather than on scroll, and a call-site `md:opacity-100 md:transform-none`
cancels the hidden state above `md:`.
