# Agents

This project uses Astro for development and Vite+ for tooling.

- **`vp run dev`** — Astro dev server
- **`vp run build`** — Astro production build
- **`vp run preview`** — Preview the Astro build
- **`vp check --fix`** — Format and lint project
- **`vp test`** — Run the Vitest suite (Vite+ bundles Vitest; the dev and prod workflows run it)
- **`vpx astro dev stop`** — Stop the active dev server; only ever run this on a server you started yourself

## Required reading

These documents are binding. You MUST consult them before acting — they are not
optional background.

- You MUST consult [docs/vite-plus.md](docs/vite-plus.md) before running or
  changing anything in the Vite+ toolchain.
- You MUST consult [docs/adr/](docs/adr/) before making structural or
  architectural changes.
- You MUST consult [docs/testing.md](docs/testing.md) before running tests,
  `vpx fallow`, or smoke-testing. [scripts/probe.mts](scripts/probe.mts) is the
  browser geometry probe it documents.
- You MUST consult [docs/motion.md](docs/motion.md) before changing motion,
  parallax or scroll-reveal behaviour.
- You MUST consult [docs/pages.md](docs/pages.md) before adding or changing a
  page or feature component.
- You MUST use the domain vocabulary defined in [docs/GLOSSARY.md](docs/GLOSSARY.md).

## Conventions

- Never write comments. Only exception is when user explicitly asks.
- Git hooks enforce `vpx astro check` on staged `.astro` files and `commitlint`
  on messages; run `vpx astro check` after changing any `.astro` file, and
  follow conventional commits (`type(scope): subject`, header max 100, body max
  200), for earlier feedback.
- When writing CSS, you MUST consult [docs/conventions.md](docs/conventions.md).
- Use British English for documentation, UI copy and code comments. Technical
  terms and API names keep their original spelling (for example CSS `color`).
- Import Phosphor icons with the `Icon` postfix (`ArrowLeftIcon`, `SunIcon`).
  The bare name (`ArrowLeft`) is a deprecated alias and must not be used in new
  code.
- The working tree can advance between your reads — re-check `git status` and
  `git log` (or re-read the reference file) immediately before dispatching
  parallel work.
