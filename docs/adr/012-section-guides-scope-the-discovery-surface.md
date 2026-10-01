# ADR 012: Section Guides Scope the Discovery Surface by Area

## Context

`llms.txt` is the site's single agent guide, and
[ADR 008](008-single-discovery-module.md) gave the discovery surface one home in
`src/features/discovery/`. The guide serves a small site well, but it describes
every area at once: the writing, the professional profile, and the
machine-readable surface. An agent that needs only one of those areas reads the
whole guide and, for full text, the entire `/llms-full.txt` archive.

The optional `is-agentic` check "Modular llms.txt per product area" recommends
per-section `llms.txt` files so an agent can fetch scoped context for the area
it is working in.

## Decision

The site publishes three section guides, each a first-class `DiscoveryResource`
in `catalog.ts`:

- `/blog/llms.txt` — the writing: every published post with its URL, date,
  description and tags, plus a tag index and a pointer to `/llms-full.txt`.
- `/developers/llms.txt` — the machine-readable surface: the published
  resources, retrieval, errors, versioning and rate limits.
- `/cv/llms.txt` — the professional profile: the pages that verify claims about
  experience, skills, education and projects.

Each carries `path`, `title`, `description`, `identifier`, `tags` and
`representativeQueries`, and deliberately no `rel`. Section guides therefore
appear in the OpenAPI document, the ARD catalogue and the developers page, but
stay out of the per-response `Link` header, as `/llms-full.txt` and `/rss.xml`
already do.

The builders live in `documents/llms.ts`. `buildBlogLlmsTxt` takes posts as
input, mirroring `buildLlmsFullTxt`; the other two are pure and read the
catalogue. Root `/llms.txt` gains a `## Section Guides` heading and excludes the
guides from `## Machine-Readable Files`, so each guide is listed once.

## Consequences

### Positive

- An agent working in one area fetches a short, focused index instead of the
  whole site or the whole archive.
- The guides are catalogue entries, so OpenAPI, the ARD catalogue, the developers
  page and the tests follow without restating anything.
- The root guide remains the single place an agent discovers them.

### Negative

- The discovery surface grows by three resources and three route shims.
- The blog guide restates post metadata that `llms-full.txt` already carries; it
  is an index, not a replacement.
- Editorial copy for the guides is a literal in the builder, as ADR 008 allows
  for the root guide.
