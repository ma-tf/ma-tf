# ADR 024: Discovery Responses Cache at the Netlify CDN

## Context

The site renders with `output: "server"` and the Netlify adapter, so every route,
including content that only changes between deploys, is served by the SSR function
([ADR 007](007-ssr-function-build-output-must-not-be-dereferenced.md)). Netlify
does not cache responses from functions by default, so every visitor request
invokes the function. A warm invocation returns in roughly 250 ms, but concurrency
and cold starts push the same request into the multi-second range: a burst of
twenty-five concurrent requests to `/` measured between five and ten seconds.

The discovery middleware ([ADR 008](008-single-discovery-module.md)) already
varies a response by the `Accept` header into HTML, markdown or JSON, but only the
markdown and JSON branches declare `Vary: Accept`. The HTML branch, which is the
common case, does not, so a shared cache could serve HTML to a client that asked
for markdown. The surface's cache policy is also inconsistent: the `.well-known`
and registry shims each set `Cache-Control: public, max-age=3600`, while the rest
of the surface sets none.

## Decision

`src/features/discovery/cache.ts` owns one cache policy, applied by
`discoveryMiddleware` to every non-API response after the `Link` header is
stamped, and the route shims stop setting their own `Cache-Control`.

- A successful `GET` or `HEAD` response carries
  `Cache-Control: public, max-age=0, must-revalidate` for the browser and
  `Netlify-CDN-Cache-Control: public, durable, s-maxage=3600, stale-while-revalidate=86400`
  for Netlify's CDN. `Vary: Accept` is appended, so the negotiated HTML, markdown
  and JSON forms get distinct cache objects.
- Every other response, an error or a non-GET method, carries
  `Cache-Control: no-store`.

The browser always revalidates, so a deploy cannot leave stale markup in a
visitor's cache. Netlify invalidates the CDN cache on every atomic deploy, so
`s-maxage` and `stale-while-revalidate` only bound how long an edge node reuses a
copy before revalidating. The `durable` directive shares that copy across edge
nodes instead of invoking the function once per node, and
`stale-while-revalidate` serves the stale copy while the function revalidates in
the background, so a revalidating request is never blocked on a cold start.

The policy is one fact, so it lives in one place, as
[ADR 008](008-single-discovery-module.md) requires of the surface.

## Consequences

### Positive

- A warm edge copy answers most requests without invoking the function, which
  removes the cold-start tail from content that does not change between deploys.
- HTML now declares `Vary: Accept` like the other representations, so caching
  cannot cross the content negotiation.
- Browser freshness and CDN freshness are separated: the browser revalidates,
  while the CDN owns `s-maxage` and `stale-while-revalidate`.
- The route shims hold no cache policy, so the surface's caching is one module.

### Negative

- Cached discovery responses can serve content up to `stale-while-revalidate`
  after an edge node's copy expires; a deploy invalidates the cache, but an
  in-flight revalidation can still return the previous copy once.
- The policy is a single constant for the whole surface, so a route that needs a
  different lifetime has to opt out of the shared helper.
- Only the headers the application emits can be observed locally; the CDN's own
  behaviour — `Cache-Status`, `Age`, a `durable` hit — exists only on a deploy.
