---
status: accepted
---

# ADR 015: Adopt NLWeb v0.55 as the Published Ask Contract

## Context

The site publishes a machine-readable discovery surface for agents ([ADR 008](008-single-discovery-module.md)) and is
adding an interactive "ask about this site" capability. The homepage needs it, but
so do external agents: without a published contract, an agent can only call it by
reverse-engineering the UI. The choice is between a bespoke JSON/SSE schema — fast
to shape, used by exactly one client — and adopting a published conversational-search
protocol so any conformant client can call the site.

NLWeb v0.55 is such a protocol: a nested request envelope, `list`/`summarize` modes,
and a single `Failure` shape. Its reference implementation and .NET port are
non-conformant with the spec (flat arguments, `generate` mode, different SSE events),
so the specification is the contract and the ports are hints only.

## Decision

`POST /ask` conforms to NLWeb v0.55:

- Nested `query`/`context`/`prefer`/`meta` request, one question per request;
  multi-turn unsupported (`context.prev` declared so rather than accepted-and-ignored).
- Modes `list` and `summarize`, with the legacy `generate` aliased to `summarize`.
- One refusal shape: `_meta.response_type: "failure"` with an `error.code` from
  the NLWeb set — `NO_RESULTS`, `INVALID_QUERY`, `UNSUPPORTED_MODE`,
  `UNSUPPORTED_FORMAT`, `TOKEN_LIMIT`, `RATE_LIMITED` — at HTTP 200.
- SSE events `start`/`result`/`error`/`complete`, plus a documented non-normative
  `delta` event carrying token chunks for the homepage's live text — a conformant
  superset.

The spec defines no discovery mechanism, so the site advertises the capability
through its own surface: OpenAPI, the AI catalogue, an `ask-site` Agent Skill, and a
non-normative `rel="nlweb"` Link relation. The site's "not metered" claim is scoped
to the GET read surface, which stays unmetered.

## Consequences

### Positive

- Any conformant NLWeb client can call the site without bespoke documentation.
- The ask capability sits beside the GET resources as an Agent capability in the
  existing discovery module, rather than as a parallel API
  ([ADR 008](008-single-discovery-module.md)).
- The refusal shape is shared by the decision gate and the answerer instead of each
  improvising its own.

### Negative

- The `delta` event is a site invention; conformant clients must ignore it, and it is
  the one part of the wire format the spec does not cover.
- `text/event-stream` collides with the middleware's `Accept` negotiation and must be
  carved out of it ([ADR 017](017-exempt-ask-from-middleware-negotiation.md)).
- v0.55 is young and was verified only from a Wayback capture (2026-05-12); §3, §4,
  §6 and Appendix A must be re-verified against the live specification before
  implementation.
