---
status: accepted
---

# ADR 017: Exempt the Ask Capability from the Middleware's Negotiation

## Context

[ADR 008](008-single-discovery-module.md) gives the discovery module one
machine-readable surface and lets
`src/middleware.ts` negotiate it for every server-rendered response: preflight
(405/406), representation selection (HTML, markdown twin, or JSON), RFC 9457
problem wrapping, and the site-wide `Link` and `RateLimit-*` headers.

`POST /ask` is an **agent capability** — an action, not a discovery resource —
published by [ADR 015](015-nlweb-as-the-published-ask-contract.md) as NLWeb v0.55
with a `text/event-stream` response. Four of
those middleware transforms are wrong for an action:

- `notAcceptableResponse` 406s `Accept: text/event-stream`, which is exactly what an
  SSE client sends.
- `problemResponse` rewrites any ≥400 into an RFC 9457 problem, but NLWeb's failures
  are HTTP 200 with a `Failure` body, and the only ≥400 is a pre-parse 413.
- `applySiteHeaders` stamps the documents `Link` and the read surface's `"m4t"`
  rate-limit policy; ask publishes its own `"m4t-ask"` policy
  ([ADR 016](016-in-app-guard-for-the-ask-capability.md)) and its own
  `rel="nlweb"`.
- `selectRepresentation` has no meaning for an action: there is no markdown twin or
  JSON descriptor of `/ask`.

## Decision

`POST /ask` is an Astro endpoint (`src/pages/ask.ts`, a thin shim per
[ADR 008](008-single-discovery-module.md)) and
is **fully exempt** from the middleware's negotiation, through a predicate that
reads the discovery module's capability list. The ask feature owns its method
handling, `Accept` validation, representation, `Link`, rate-limit and problem
surface.

## Considered Options

- **Partial carving** (share the `Link` header and the problem shape): rejected —
  it gives one wire contract two owners, and the SSE and content-type rules differ
  at every point.
- **Add `text/event-stream` to the middleware's representable types**: rejected —
  it loosens negotiation for every route to serve one endpoint.
- **A standalone Netlify Function**: rejected — it bypasses the middleware, and
  `netlify.toml` headers do not apply to functions, so it duplicates the header and
  negotiation logic.
- **A general capability registry**: deferred — one endpoint does not justify the
  framework.

## Consequences

### Positive

- The endpoint has a single owner for a wire contract that must be
  NLWeb-conformant.

### Negative

- The middleware is no longer a universal gate: every SSR response _except_ `/ask`
  passes through negotiation. The exception is keyed off the discovery module and
  the route reuses the shared `linkHeader`, so drift is bounded.
- `/ask` must reconstruct the site's problem and header behaviour itself.
