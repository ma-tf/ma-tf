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
