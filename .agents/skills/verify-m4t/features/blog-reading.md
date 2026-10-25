# Blog reading

The writing index, a post, and the tag orbit.

## Sub-features

- `blog-index`: `/blog` lists every published post, newest first.
- `blog-pane`: at 768px and up the shell pins the viewport and an inner pane
  scrolls; below that the document scrolls.
- `post`: `/posts/<slug>` renders the MDX body with date, word count, reading
  time, tag pills and the bird break.
- `post-bird`: a button that replays the pigeon sound and shakes the bird.
- `tag-orbit`: `/tags/<tag>` spins a wheel of tags; arrow keys rotate, Enter
  selects, the selected panel lists posts under `:: YYYY-MM` headings.
- `mobile-menu`: below 768px the blog and post pages collapse their section nav
  behind a button named `menu`.

## How to get to it (user POV)

From the home page's "Latest posts", or `/blog`. Click a post title. Click a tag
pill (`#tag`) on a post to reach its tag page. On a narrow viewport, open `menu`
to reach Home, Photography, Vignettes and Music.

## Driving it with control-m4t

Preconditions:

- `/blog` is reachable and 11 posts are published.
- A 1280x900 viewport, so the inner pane scrolls instead of the document.

```sh
node .agents/skills/verify-m4t/control-m4t.mjs goto /blog --viewport=1280x900
node .agents/skills/verify-m4t/control-m4t.mjs count '[data-blog-scroll-target] a[href^="/posts/"]'
node .agents/skills/verify-m4t/control-m4t.mjs scroll --pane='[data-blog-scroll-target]' --y=400
node .agents/skills/verify-m4t/control-m4t.mjs eval 'document.querySelector("[data-blog-scroll-target]").scrollTop'
node .agents/skills/verify-m4t/control-m4t.mjs click '[data-blog-scroll-target] a[href^="/posts/"]'
node .agents/skills/verify-m4t/control-m4t.mjs eval 'location.pathname'
node .agents/skills/verify-m4t/control-m4t.mjs count 'a[href^="/tags/"]'
node .agents/skills/verify-m4t/control-m4t.mjs click 'a[href^="/tags/"]'
node .agents/skills/verify-m4t/control-m4t.mjs eval 'location.pathname'
node .agents/skills/verify-m4t/control-m4t.mjs screenshot blog-tag.png
```

End state: 11 post links, the pane's `scrollTop` is greater than zero, the post
URL matches `/posts/...`, and the tag pill lands on `/tags/<tag>`.

Tag journey:

```sh
node .agents/skills/verify-m4t/control-m4t.mjs goto /tags/typescript --viewport=1280x900
node .agents/skills/verify-m4t/control-m4t.mjs count 'a[href^="/posts/"]'
node .agents/skills/verify-m4t/control-m4t.mjs click '[role="group"][aria-label^="Orbit"]'
node .agents/skills/verify-m4t/control-m4t.mjs press ArrowRight
node .agents/skills/verify-m4t/control-m4t.mjs press Enter
node .agents/skills/verify-m4t/control-m4t.mjs eval 'location.pathname'
```

End state: the orbit takes focus, ArrowRight rotates, and Enter lands on the
front tag's page (from `/tags/typescript`, that is `/tags/dx`).

## Gotchas

- `scroll --y` moves the window, which is a no-op at desktop on `/blog`. Use
  `--pane='[data-blog-scroll-target]'`.
- The tag pages set `overflow: hidden` on the body and swallow wheel input to
  rotate the orbit; do not expect window scrolling there.
- Post content comes from MDX in `src/content/posts`; a missing banner or bird
  media is a CDN problem, not a route problem.
- `/tags` itself shows "No tag selected"; only tag links inside posts point at
  individual tag pages.
