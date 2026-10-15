# Middleware notes

- The `Link` header applies to every non-API response, including prerendered and
  error responses. Negotiation and problem wrapping do not; API paths bypass all
  three.
- `applyCacheHeaders` (`cache.ts:12`) stamps the cache policy on every non-API
  response after the `Link` header: a `200` `GET` or `HEAD` is cached at the
  Netlify CDN (`durable`, `s-maxage`, `stale-while-revalidate`) and varies by
  `Accept`, so the negotiated HTML, markdown and JSON forms are cached
  separately; every other response is `no-store`. It also sets
  `Netlify-Vary: query=none`, so every query variant of a path shares one cache
  object while `Vary: Accept` keeps the representations apart. See
  [ADR 024](adr/024-discovery-responses-cache-at-the-cdn.md) and
  [ADR 025](adr/025-query-parameters-do-not-key-the-discovery-cache.md).
- `wideEventMiddleware` is the outermost handler; the discovery work happens in
  the inner `discoveryMiddleware`. `sequence` guarantees the event wraps the
  whole request whichever inner branch returns.
- One wide event is opened for every request, emitted for API paths always and
  for non-API paths at or above 400. A streaming `/ask` response defers emission
  to the stream generator. See [logging.md](logging.md) and
  [ADR 016](adr/016-wide-event-logging.md).
- Preflight returns at `middleware.ts:60` and the prerendered bypass at
  `middleware.ts:56`, both before the `status >= 400` wrap, so a 405 or 406 is
  never re-wrapped as a problem. The agent skill bypass sits at
  `middleware.ts:63`, after preflight but before negotiation, so it is
  problem-wrapped.
- The rate limiter returns `{ limited, headers }`: `limited` holds the `429`
  response when a client is over quota and is `null` otherwise; `headers`
  carries the `RateLimit-*` headers to apply to the success response. The
  response status is what the wide event records. When the
  check fails open (no client IP, missing `RATE_LIMIT_SALT`, blob-store error)
  the limiter warns on its own and returns a `null` limited with empty headers.
- `formatMarkdownResponse` returns a non-HTML response unchanged
  (`markdown.ts:18`), so the two markdown branches silently skip both conversion
  and `Vary` in that case.
- The canned problems cover 404, 405, 406 and 500; any other status falls back
  to a server-error-shaped body carrying the original status (`problems.ts:77`).
- `isResourcePath` matches any `/.well-known/*` path, not only catalogued ones
  (`catalog.ts:141`), so 405 and 406 apply more widely than descriptor
  negotiation does.
- `prefersHtml` (`negotiation.ts:71`) requires an explicit `text/html` or
  `text/*`; `acceptsSupportedRepresentation` still counts `*/*`, so a wildcard
  client is never rejected with a 406.
