# ADR 013: API Endpoints Bypass the Discovery Middleware

## Context

[ADR 008](008-single-discovery-module.md) put representation negotiation in
`src/middleware.ts`. Every non-prerendered request runs through
`preflightResponse` (405 for a non-GET request to a resource path, 406 for an
Accept header the site cannot represent), then `selectRepresentation`, then
`problemResponse` for anything at or above 400, and finally the discovery `Link`
header is stamped onto the response.

Those rules describe documents. `POST /ask` is an API endpoint. It negotiates
its own media type (SSE via `Accept: text/event-stream`), returns its own error
shape (an NLWeb failure document rather than an RFC 9457 problem), and its
statuses are protocol-level: 200 for a successful response including an
application-level failure, 400 for a malformed request structure.

Applied to an API endpoint, the middleware produces three wrong outcomes: a 406
for the SSE Accept header that its own protocol defines, which the endpoint
never sees; problem+json rewrites of bare protocol statuses; and the discovery
`Link` header on a non-document response.

An earlier decision exempted `/ask` by name. This ADR replaces that one-off with
the rule behind it.

## Decision

`src/lib/api-paths.ts` separates two decisions. A bypass set names the paths
exempt from representation negotiation, and a separate limit map names the paths
metered before routing. `onRequest` consults the bypass set; for a member it
enforces that path's pre-route limit, if it has one, and then returns `next()`
unchanged, before preflight, representation selection, problem rewriting and
site headers ([ADR 014](014-the-ask-endpoint-meters-requests-per-client.md)).

The bypass set currently holds `/ask`, and the limit map holds `/ask` with the
ask policy. A path can be a bypass without a pre-route limit.

An API endpoint is therefore responsible for its own media type, status codes,
error shape and `Vary` header.

## Consequences

### Positive

- `/ask` returns the media type the client asked for, including
  `text/event-stream`, and can return its protocol statuses unaltered.
- The rule is stated once instead of exempting paths by name at each call site.
- Adding an endpoint means adding its path to the bypass set, and the middleware
  needs no endpoint-specific knowledge.

### Negative

- Endpoints in the bypass set lose the discovery `Link` header and must set their
  own `Vary` header.
- The bypass set and the limit map are literal lists, so a new API path that is
  not registered in the bypass set is silently subject to document negotiation
  again.
- An endpoint that enforces a limit publishes its own policy, as `/ask` does; an
  unmetered surface publishes none.
