# ADR 014: The Ask Endpoint Meters Requests Per Client

## Context

`/ask` is the only endpoint that spends money per request: a TypeSafe judgment
over the whole published corpus and, unless the caller asked for a list, an
OpenAI completion. It is unauthenticated by design, so one client could drive
that cost without limit.

[ADR 013](013-api-endpoints-bypass-the-discovery-middleware.md) left the endpoint
to publish its own policy, since it no longer inherits the site headers. Every
other surface is unmetered and publishes no rate-limit headers, and several
documents state that those surfaces never return `429`.

## Decision

`POST /ask` is metered per client at 20 requests per 60 seconds. Past that the
middleware returns `429` with `Retry-After` and the ask bucket's `RateLimit-*`
values, and no NLWeb document: the specification scopes rate limiting to the
transport layer and names a `429` with `Retry-After` as the mechanism.

Only an enforced limit publishes `RateLimit-*`; an unmetered surface publishes
none.

The policy is `askRateLimit` in `src/lib/rate-limits.ts`, because the OpenAPI
document, `llms.txt`, the Agent Skills index and the
developers page all publish it. `src/lib/api-paths.ts` separates the bypass set,
which names the paths exempt from representation negotiation, from a separate
limit map, which names the paths metered before routing and holds `/ask`;
`src/middleware.ts` enforces that map pre-route, so an endpoint stays exempt from
representation negotiation but not from metering.

`src/lib/rate-limit-middleware.ts` enforces it against a Netlify Blobs store keyed by
`sha256(salt + client IP)`, so no address is persisted. The client IP is the
visitor address Cloudflare forwards (`CF-Connecting-IP`) when present, falling
back to Netlify's connection address and then the first forwarded address,
because the site is proxied through Cloudflare and Netlify's connection address
is then a Cloudflare edge, not the visitor. The salt comes from
`RATE_LIMIT_SALT`; a deployed function (one with `DEPLOY_ID` set) writes to the
global store, local development to the deploy store; and the store uses
`consistency: "strong"` because the default eventual consistency can lag the
60-second window.

The counter is best-effort, since Blobs has no conditional write, and the check
fails open on local development, a missing client IP, a missing salt, or any
store error.

## Consequences

### Positive

- One client can no longer drive unbounded provider spending through an
  unauthenticated endpoint.
- No addresses are stored, and a client is counted consistently across
  serverless instances.
- The check runs before the endpoint, so a new metered endpoint cannot forget it.

### Negative

- Concurrent bursts can undercount, a missing `RATE_LIMIT_SALT` disables the
  limit (a warning is logged), and fixed windows admit a boundary burst of up to
  twice the quota.
- The limit is per IP, so it is a cost guard rather than access control.
- An endpoint that is switched off is metered before its route can answer, so an
  over-limit request gets `429` rather than `404`.
- The documents claiming the site never returns `429` needed a carve-out for
  `/ask`.
