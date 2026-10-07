# Agents

This project uses Astro for development and Vite+ for tooling.

- **`vp run dev`** — Astro dev server
- **`vp run build`** — Astro production build
- **`vp run preview`** — Preview the Astro build
- **`vp check`** — Format and lint project
- **`vp test`** — Run the Vitest suite (Vite+ bundles Vitest; the CI workflows do not run it)
- **`vpx astro dev stop`** — Stop the active dev server; only ever run this on a server you started yourself

## Required reading

These documents are binding. You MUST consult them before acting — they are not
optional background.

- You MUST consult [docs/vite-plus.md](docs/vite-plus.md) before running or
  changing anything in the Vite+ toolchain.
- You MUST consult [docs/adr/](docs/adr/) before making structural or
  architectural changes.
- You MUST consult [docs/testing.md](docs/testing.md) before running tests or
  smoke-testing. [scripts/probe.mts](scripts/probe.mts) is the browser geometry
  probe it documents.
- You MUST consult [docs/motion.md](docs/motion.md) before changing motion,
  parallax or scroll-reveal behaviour.
- You MUST use the domain vocabulary defined in [docs/GLOSSARY.md](docs/GLOSSARY.md).

## Conventions

- Never write comments. Only exception is when user explicitly asks.
- You MUST run `vpx astro check` after changing any `.astro` file.
- When writing CSS, you MUST consult [docs/conventions.md](docs/conventions.md).
- Commit messages follow conventional commits: lower-case `type(scope): subject`,
  header and body lines max 100 characters, body max 200 characters total.
