# Testing

How to run the project's checks, and the rules for smoke testing against a
running server. See [vite-plus.md](vite-plus.md) for the toolchain commands.

## Commands

- `vp test` — run the test suite.
- `vpx astro check` — Astro diagnostics; run after changing any `.astro` file.
- `vp check` — format and lint.
- `vp run build` — production build.

## Smoke testing

Rendered HTML is not in `dist/` (the site is SSR), so verifying a page's markup
means requesting it from a running server.

- **Never stop or kill a dev server you did not start.** `vpx astro dev stop`
  stops the project's active server — it may belong to the developer. Do not run
  it to clean up after a smoke test.
- Before starting a server, check whether one is already listening
  (e.g. `curl -sf http://localhost:4321/`) and reuse it if so.
- If you must start a server, leave it running when done, or ask first.
- Prefer asking the developer to keep a server up rather than launching one
  yourself.

## Visual probing

`scripts/probe.mts` drives a headless Chromium through Playwright to inspect
rendered geometry. For every selector it prints the `getBoundingClientRect()`
values (`top`, `height`, `bottom`) plus the computed `position`, `display`,
`transform` and `font-size`, and it can save a screenshot.

```sh
node scripts/probe.mts http://localhost:4321/about \
  --viewport=390x844 \
  --shot=/tmp/about-390.png \
  h1 header "[data-parallax]"
```

- `--viewport=<width>x<height>` — viewport size (required).
- `--scroll=<y>` — scroll to a vertical offset before probing.
- `--shot=<path>` — save a viewport screenshot.
- `--wait=<ms>` — wait after load and scroll before probing.

Playwright is pinned to the Chromium build already cached under
`~/.cache/ms-playwright`, so the probe needs no browser download.
