# ADR 025: Query Parameters Do Not Key the Discovery Cache

## Context

[ADR 024](024-discovery-responses-cache-at-the-cdn.md) caches non-API responses
at the Netlify CDN. Netlify factors every query parameter into the cache key by
default for serverless functions, so `/?utm_source=one` and `/?utm_source=two`
are distinct cache objects, and populating each one invokes the SSR function.
Nothing in the site reads a query parameter: every page and route resolves from
the pathname and path-segment `Astro.params`. The default therefore lets a
caller — a marketing link, a crawler, or an attacker — mint unbounded cache
objects and force origin invocations for content that is identical.

`Netlify-Vary` supports a subset of query keys (`query=item_id|page`), but it has
no instruction for "no query parameters": the subset grammar requires at least
one key and rejects an empty list.

## Decision

`applyCacheHeaders` sets `Netlify-Vary: query=none` on every non-API response,
alongside the [ADR 024](024-discovery-responses-cache-at-the-cdn.md) policy. The
key `none` is reserved: no request carries it, so by Netlify's documented
non-match rule every query variant of a path shares one cache object. The header
is set unconditionally, so every response for a URL carries the same value, as
Netlify requires. Representation negotiation still keys the cache through
`Vary: Accept`; only the query component is collapsed.

`src/features/discovery/query-params.test.ts` fails if `searchParams`,
`URLSearchParams` or `.search` appears anywhere in `src/`, so a future route that
reads a query parameter is forced to revisit this decision rather than silently
serving one cached object for every value.

## Consequences

### Positive

- A caller cannot fragment the cache or force origin invocations by varying a
  query string.
- Tracking parameters no longer create duplicate cache objects.

### Negative

- The directive relies on the reserved key never being used and on the non-match
  rule, not on a documented "ignore query" feature; a request carrying
  `?none=…` would vary.
- The decision is only safe while no route reads a query parameter. The guard
  test enforces that, but it also means adding such a route requires changing
  this policy and its test deliberately.
- Whether the application's header replaces or merges with Netlify's default one
  can only be confirmed on a deploy.
