# ADR 020: The Ask Corpus Is a Pure Module

## Context

The Ask corpus and the MCP resource catalogue are generated before `dev` and
`build` by `scripts/generate-ask-corpus.mts`. That script was 560 lines holding
four unrelated things: the `astro dev` lifecycle, fetching and parsing the
sitemap and markdown representations, the pure transformation from pages and
tags into the two artefacts, and the staleness hash that decides whether to
regenerate.

Only the pure helpers were tested, and the tests reached them by importing a
build script. The transformation and the shell that fed it were entangled, so a
change to tag application, body matching or staleness meant editing a file that
also spawns a server. `src/features/mcp/read.ts` separately re-declared the
generated resource shape as `McpResource & { text: string }`, so the writer and
the reader could drift.

The one impure step the transformation needs is the body of each discovery
resource, which only a running server can serve.

## Decision

A pure module, `src/features/ask/corpus/`, owns the transformation:

- `index.ts` — `buildCorpus`, `corpusStatus` and `corpusSourceHash`, plus the
  re-exported types.
- `types.ts` — the artefact and input types (`CorpusPage`, `CorpusResource`,
  `CorpusArtefact`, `ResourceArtefact`, `CorpusInput`, `CorpusStatus`,
  `StoredCorpus`), importing nothing from `node:` or `astro:`.
- `tags.ts` — `applyAskTags`, an internal seam tested by its own file.
- `hash.ts` — the content hash and its TypeScript import walk, an internal seam
  except for `corpusSourceHash`.

`buildCorpus(input)` takes `{ pages, resources, tags, sourceHash, fetchBody }`
and returns `{ corpus, catalogue }`. `fetchBody` is the single impure step,
injected, so the module is a pure function of its inputs. The module stamps
`sourceHash` into both artefacts and reuses a page's markdown twin when a
resource shares its URL, so the shell only fetches what the pages did not.

`corpusStatus(sourceHash, stored)` returns `current` or a stale reason
(`corpus-missing`, `corpus-hash`, `resources-missing`, `resources-hash`,
`empty-catalogue`), replacing the pair of near-inverse predicates
(`shouldRegenerate` / `isCatalogueCurrent`) that previously answered the same
question two ways.

The shell, `scripts/generate-ask-corpus.mts`, keeps the dev-server lifecycle
(`scripts/dev-server.mts`), the sitemap and page fetching, the file reads and
writes, the `--check` / `--force` flags and the exit codes. It reaches the
Resource catalogue through the dev-only `/mcp-catalogue.json` route, because
`astro:content` cannot be imported outside Astro; that route is the adapter at
the content seam. `--check` stays hash-only and never starts a server.

`read.ts` imports `ResourceArtefact` from the module instead of re-declaring it.

The shell imports the module through tsconfig path aliases, which plain Node
cannot resolve; see [ADR 021](021-build-scripts-resolve-path-aliases.md).

## Consequences

### Positive

- The transformation is a pure module testable without a server, and a
  byte-identical test proves it reproduces the committed artefacts from their
  inputs.
- Tag application, body matching, staleness and hashing each sit behind a small
  interface with a test at that seam.
- The dev-server lifecycle is one unit with an idempotent `stop`, isolating the
  leak that a recent fix addressed.
- The writer and the reader share one artefact shape.
- `corpusStatus` answers the staleness question in one place instead of two
  near-inverse predicates.

### Negative

- The shell still needs a running `astro dev` to reach `astro:content`, so a
  full generation needs a port and is slower than the transformation it feeds.
- `--check` only compares hashes, so it cannot detect a hand-edited artefact
  whose hash still matches.
- The corpus module has to be reached through the alias resolver in
  [ADR 021](021-build-scripts-resolve-path-aliases.md).

## Applied To

- `src/features/ask/corpus/`
- `scripts/generate-ask-corpus.mts`
- `scripts/dev-server.mts`
- `src/features/mcp/read.ts`
