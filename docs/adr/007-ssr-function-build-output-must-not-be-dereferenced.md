# ADR 007: SSR Function Build Output Must Not Be Dereferenced

## Context

The site renders with `output: "server"` and the Netlify adapter, so every route is served by a
single SSR function that the adapter writes to `.netlify/v1/functions/ssr/`.

The adapter traces that function's dependencies with `@vercel/nft` and copies them into place. On a
pnpm install the copy preserves pnpm's symlinked layout: direct dependencies are materialised at
`node_modules/<package>`, while transitive dependencies exist only under `node_modules/.pnpm/…` and
are reached through symlinks inside each package's own `node_modules`. Both the adapter
(`copyFilesToFolder` recreates symlinks with `fs.symlink`) and Netlify's packaging
(`zip-it-and-ship-it` does `lstat` → `readlink` → `symlink`, and `archive.js` writes symlink entries
into the function zip) deliberately preserve those links.

`actions/upload-artifact` does not. It dereferences symlinks, so an artifact restored on another
runner has none. The transitive dependencies then survive only under `node_modules/.pnpm/…`, which
Node never consults when resolving from the flattened top-level paths, so the function fails at
import time. The failure surfaces as an empty HTTP 500 on every SSR route with no application logs,
only a bootstrap `ERR_MODULE_NOT_FOUND`. Releases v0.0.15 through v0.0.17 were deployed in this
state.

## Decision

The Astro Netlify SSR function must stay on one filesystem from build to deploy.

The production workflow builds and deploys in a single job on a single runner, and `.netlify/` must
never pass through `actions/upload-artifact` or `actions/download-artifact`. A job boundary is an
artifact boundary, so splitting the workflow into `build` and `deploy` jobs joined by `needs:`
breaks the same constraint. If build output must ever move between runners or be archived, use
`tar`, which preserves symlinks.

The deploy is also smoke-tested. A successful `netlify deploy` only means the upload was accepted,
so the production workflow requests the site and fails on anything other than HTTP 200.

## Consequences

### Positive

- The SSR function resolves its dependencies, so production serves pages.
- The smoke test turns a silent production outage into a failed workflow.
- The build and the deploy run on one machine, so a deploy cannot be produced by an environment
  other than the one that verified it.

### Negative

- A tagged commit is built twice: once by the dev workflow on `master`, once by the production
  workflow on the tag.
- The `R2_*` and `PUBLIC_PREVIEW_*` environment block is duplicated across both workflows, because
  factoring the build into a reusable workflow would introduce the job boundary this ADR forbids.
- A previously built artifact cannot be re-deployed without rebuilding.
