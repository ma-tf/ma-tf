# ADR 008: One Discovery Module Owns the Machine-Readable Surface

## Context

The site publishes a machine-readable surface for agents and clients, and it grew
one commit at a time: markdown negotiation in the middleware, resource metadata in
`resource-catalog.ts`, then OpenAPI, the API catalogue (RFC 9727), the AI
catalogue, `llms.txt`, `llms-full.txt`, `robots.txt`, `sitemap.xml` and RSS, each
added independently.

Only four consumers read the shared resource list: the homepage `Link` header, the
OpenAPI document, the API catalogue, and the developers page. The rest restate the
same facts in their own literals:

- `ai-catalog.json.ts` hand-writes five entries that differ from the seven in
  `resources`.
- `public/llms.txt` hand-writes the page list and the machine-readable file list.
- `public/robots.txt` hardcodes the `Sitemap` and `Agentmap` URLs.
- `Layout.astro` hardcodes the AI-catalogue path.
- The RFC 9457 problem shapes are defined in both `middleware.ts` and
  `openapi.json.ts`.
- `sitemap.xml.ts` hardcodes the static path list.

These duplicate representations can drift without a failing check, and they
already have. Each new discovery file raises the surface again with no shared
model to anchor it.

The `is-agentic` CLI is already a devDependency and scores the live site's agent
readiness. Several of its checks map directly to this surface — agent-friendly
404s, markdown content negotiation, and the presence of discovery documents — so
the surface is not only internally consumed but externally scored.

## Decision

The discovery surface is a single feature, `src/features/discovery/`, which owns:

- `catalog.ts` — `siteUrl` and one `DiscoveryResource` model. Every resource
  carries `path`, `type`, `title`, `description`, and `rel` where a relation
  exists, plus the AI-catalogue fields `identifier`, `tags`, and
  `representativeQueries`. The AI catalogue is built from all seven resources
  rather than a hand-written subset.
- `negotiation.ts` and `markdown.ts` — content negotiation, `Vary` handling, and
  HTML-to-markdown conversion.
- `problems.ts` — the RFC 9457 problem model, shared by the middleware and the
  OpenAPI document.
- `documents/*.ts` — pure builders for `openapi`, `api-catalog`, `ai-catalog`,
  `llms`, `robots`, and `sitemap`, each taking the catalogue or its inputs and
  returning the document.

Astro requires routes under `src/pages/` and middleware at `src/middleware.ts`, so
those files remain, as thin shims that import the feature and hold no data.
`public/llms.txt` and `public/robots.txt` are removed; `src/pages/llms.txt.ts` and
`src/pages/robots.txt.ts` serve them so their URLs derive from the catalogue.

Editorial copy is not derived per-resource: the `llms.txt` prose and the
`robots.txt` content-signal policy stay as literals inside their builders.

## Consequences

### Positive

- One place to add, edit, or remove a discovery resource; every catalogue and the
  homepage `Link` header follow.
- The AI catalogue grows from five entries to seven: `robots.txt` and the AI
  catalogue itself gain identifiers, tags, and representative queries, and the
  problem shapes can no longer drift from the OpenAPI document.
- New work in this area has an obvious home instead of re-stating titles and
  descriptions.
- Imports move to the `@features` alias, so the `.well-known` routes comply with
  ADR 004.
- The builders are pure functions and can be tested without a running server.
- A single coherent model keeps the inputs to the `is-agentic` score aligned;
  `npx is-agentic m4t.tf` can validate the deployed surface end to end.

### Negative

- Route files still exist as shims; a feature cannot own routing in Astro.
- Editing `llms.txt` prose means editing the module, not a static file.
- Deriving the sitemap from the filesystem is deferred; `staticPaths` stays an
  explicit list for now.
- The surface is now one module, so a defect there can affect several endpoints at
  once.
