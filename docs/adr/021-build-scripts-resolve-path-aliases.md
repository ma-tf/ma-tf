# ADR 021: Build Scripts Resolve Path Aliases at Runtime

## Context

[ADR 004](004-always-use-path-aliases.md) requires every import to use a tsconfig
path alias and forbids relative imports. The `scripts/*.mts` files run under plain
`node`, which does not read tsconfig `paths`, so a script cannot import another
local module at runtime. That is why `generate-ask-corpus.mts` had to hold all of
its logic in one file, importing the shared `McpResource` type only as a
type-only import that is erased before Node ever resolves it.

Moving the corpus logic into `src/features/ask/corpus/` (see
[ADR 020](020-ask-corpus-is-a-pure-module.md)) needs the shell to import that
module as a value, so the alias gap had to be closed.

## Decision

`scripts/alias-loader.mjs` registers a Node module resolve hook
(`module.registerHooks`) that maps the project's aliases (`@/`, `@features/`,
`@lib/`, `@content/`, `@components/`, `@hooks/`, `@layouts/`, `@pages/`,
`@stores/`, `@data/`, `@ui/`) to file URLs, probing source extensions and
`index` files. The corpus commands run the generator with
`node --import ./scripts/alias-loader.mjs scripts/generate-ask-corpus.mts`.

The loader changes nothing for tests or source: Vitest and `tsc` already resolve
the same aliases, so a script and the modules it imports now use the aliases ADR
004 requires.

## Consequences

### Positive

- Scripts can import local modules with the same aliases as `src`, so build
  logic can live in a feature module instead of one monolith.
- No new dependency and no bundler; the loader uses Node's own resolver hook.
- Tests and type-checking are unaffected, because they already resolve aliases.

### Negative

- The alias list in the loader duplicates the tsconfig `paths`, so the two can
  drift; the loader could read `paths` from `tsconfig.json` to remove that.
- `node --import` is now required by every command that runs the generator; the
  three `package.json` scripts that call it carry the flag, and CI inherits them.
- The loader relies on `module.registerHooks`, available only on Node 22.15+ and
  pinned by `.node-version` to 26.

## Applied To

- `scripts/alias-loader.mjs`
- `package.json`
