# Agents

This project uses Astro for development and Vite+ for tooling.

- **`vp run dev`** — Astro dev server
- **`vp run build`** — Astro production build
- **`vp run preview`** — Preview the Astro build
- **`vp check`** — Format and lint project
- **`vp test`** — Run all tests
- **`vpx astro dev stop`** — Stop the active dev server; only ever run this on a server you started yourself

## Required reading

These documents are binding. You MUST consult them before acting — they are not
optional background.

- You MUST consult [docs/vite-plus.md](docs/vite-plus.md) before running or
  changing anything in the Vite+ toolchain.
- You MUST consult [docs/adr/](docs/adr/) before making structural or
  architectural changes.
- You MUST consult [docs/testing.md](docs/testing.md) before running tests or
  smoke-testing.
- You MUST use the domain vocabulary defined in [docs/CONTEXT.md](docs/CONTEXT.md).

## Conventions

- Avoid passing props where possible.
- You MUST run `vpx astro check` after changing any `.astro` file.
- When writing CSS, you MUST consult [docs/conventions.md](docs/conventions.md).
