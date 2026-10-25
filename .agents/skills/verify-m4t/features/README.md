# m4t.tf verification map

This directory is the maintained source for verifying the user-facing behaviour
of m4t.tf. Read this index before driving, then use the matching feature file as
the recipe.

## Baseline preconditions

- The site answers at `http://localhost:4321` (or the `--base` you pass), running
  from this checkout.
- `node .agents/skills/verify-m4t/control-m4t.mjs doctor` reports `healthy`.
- Seed data is fixed: 11 published posts, 24 photography frames, 7 enabled
  vignettes.
- Ask needs `TYPESAFE_API_KEY` and `OPENAI_API_KEY`; `vp run dev` injects them
  through `secretspec`.
- Never drive an instance this run has not health-checked.

## Driving conventions

- Start every recipe with `goto` on the named route; `goto` resets scroll.
- Prefer `data-slot`, `data-*` and ARIA handles over CSS selectors or DOM
  position.
- Treat every command as literal. Keep quoted selectors unchanged.
- Drive the browser only through `control-m4t.mjs`; assert with `text`, `count`,
  `attr` and `eval`.
- Use `--pane` for inner scroll containers; `--y` moves the window.
- Restore state a recipe mutates. Do not remove evidence during cleanup.

## Proof and skip reporting

- Capture the action and the resulting state, not only the final screen.
- UI proof is an ARIA snapshot or a `text`/`eval` assertion plus a viewport
  screenshot.
- Side-effect proof is a second read: clipboard contents, a toast title, a
  `requests` entry.
- Record the feature and route with every artifact.
- Report an unreachable path with the attempted command and the unmet
  precondition.
- Do not report a skipped entry point as verified through a different path.

## Feature entry contract

Each feature file starts with an H1 and one paragraph, then exactly four H2s in
this order: `Sub-features`, `How to get to it (user POV)`,
`Driving it with control-m4t`, `Gotchas`. The driving section starts with
`Preconditions:` and pairs each user action with the literal command and the
observable result.

## Features

- [Command palette](command-palette.md) — open, filter, navigate, run an action,
  read the side effect.
- [Blog reading](blog-reading.md) — index, inner pane, post, tag pill, tag
  orbit, mobile menu.
- [Photography lightbox](photography-lightbox.md) — grid, dialog, caption toggle,
  close.
- [Ask](ask.md) — composer, answer, sources, refusal, error, endpoint.
- [Discovery surface](discovery-surface.md) — llms, OpenAPI, catalogues, feeds,
  negotiation, MCP.

## Not mapped yet

`/music` and `/vignettes/<slug>` (Bandcamp, Mixcloud and Mux playback),
`/graphics` (a stub), `/cv` and the `cv.pdf` generator, `/about`, `/contact`,
`/privacy`, `/404`, `/500`, and `/prototypes/*` (untracked work in progress).
Add one file per feature as you prove it.
