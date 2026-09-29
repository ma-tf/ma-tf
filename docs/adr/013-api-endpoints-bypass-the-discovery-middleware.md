# ADR 013: API Endpoints Bypass the Discovery Middleware

## Context

[ADR 008](008-single-discovery-module.md) put representation negotiation in
`src/middleware.ts`. Every non-prerendered request runs through
`preflightResponse` (405 for a non-GET request to a resource path, 406 for an
Accept header the site cannot represent), then `selectRepresentation`, then
`problemResponse` for anything at or above 400, and finally `applySiteHeaders`,
which stamps the discovery `Link` header and the advertised `RateLimit-*` values
onto the response.

Those rules describe documents. `POST /ask` is an API endpoint. It negotiates
its own media type (SSE via `Accept: text/event-stream`), returns its own error
shape (an NLWeb failure document rather than an RFC 9457 problem), and its
statuses are protocol-level: 200 for a successful response including an
application-level failure, 400 for a malformed request structure.

Applied to an API endpoint, the middleware produces four wrong outcomes: a 406
for the SSE Accept header that its own protocol defines, which the endpoint
never sees; problem+json rewrites of bare protocol statuses; the discovery `Link`
header on a non-document response; and advertised rate-limit values for an
endpoint that does not enforce them.

An earlier decision exempted `/ask` by name. This ADR replaces that one-off with
the rule behind it.

## Decision

`src/lib/api-paths.ts` exports an `apiPaths` set and an `isApiPath` predicate.
`onRequest` returns `next()` unchanged for those paths, before preflight,
representation selection, problem rewriting and site headers.

The set currently holds one entry, `/ask`.

An API endpoint is therefore responsible for its own media type, status codes,
error shape, `Vary` header and rate-limit headers.

## Consequences

### Positive

- `/ask` returns the media type the client asked for, including
  `text/event-stream`, and can return its protocol statuses unaltered.
- The rule is stated once instead of exempting paths by name at each call site.
- Adding an endpoint means adding one path, and the middleware needs no
  endpoint-specific knowledge.

### Negative

- Endpoints in the set lose the discovery `Link` header and must set their own
  `Vary` and rate-limit headers.
- The set is a literal list, so a new API path that is not registered is
  silently subject to document negotiation again.
- The Ask endpoint no longer inherits the site's advertised rate-limit values,
  which it never honoured; it must publish its own policy if it enforces one.
