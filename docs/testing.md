# Testing

How to run the project's checks, and the rules for smoke testing against a
running server. See [vite-plus.md](vite-plus.md) for the toolchain commands.

## Commands

- `vp test` — run the test suite.
- `vpx astro check` — Astro diagnostics; run after changing any `.astro` file.
- `vp check --fix` — format and lint (auto-fixes; the pre-commit hook fails on unapplied fixes).
- `vp run build` — production build.
- `vpx fallow` — static quality gate: dead code, complexity, duplication.

## Static quality gate

`vpx fallow` exits 0 when clean and 1 on findings. The pre-push hook
runs `fallow audit`.

- Fix the breach sections (Dead Code, Complexity), not the closing hint:
  the final "start with …" line names an advisory refactoring target,
  which can differ from the actual breaches.
- CRAP scores are estimated from export references; pass
  `--coverage <coverage-final.json>` for exact scores.
- For per-function detail, use the fallow MCP `check_health` and
  `inspect_target` tools, or
  `fallow health --complexity --complexity-breakdown --format json --quiet`.

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
