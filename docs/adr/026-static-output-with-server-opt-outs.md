# ADR 026: Static Output with Server Opt-Outs

## Context

The site rendered with `output: "server"`, so every route was served by the
SSR function the Netlify adapter writes (see ADR 007), with CDN caching layered
in front (see ADR 024). A first pass then marked the static surface route by
route with `export const prerender = true`, leaving some thirty flags scattered
across pages, document routes and well-known shims. Each new static page needed
its own opt-in, and the flags duplicated what the default could state once.

## Decision

The default is flipped: `output: "static"` in `astro.config.mjs`, so
prerendering is the default and every per-page `prerender = true` flag is
removed. Six routes opt back out with `export const prerender = false`:

- `ask.ts`: POST-only streaming endpoint with per-client metering
  (see ADR 013 and ADR 014).
- `mcp.ts`: POST-only MCP handler with per-request host and origin validation.
- `api/llms.txt.ts`: part of the `/api/*` surface, which bypasses the discovery
  middleware (see ADR 013) and stays served by the function.
- `404.astro`: suggests paths from the requested URL, so it renders per request.
- `500.astro`: only the function can render it when something fails.
- `mcp-catalogue.json.ts`: dev-only; it returns 404 outside development, so
  baking it at build time would freeze one environment's answer.

The dynamic `[...tag]`, `[...slug]`, `[slug]` and skill-shim routes keep their
`getStaticPaths` functions, which static output still requires. The Netlify
adapter stays: it now serves only the six opt-outs. Tailwind, the remark
plugins and the env schema are untouched.

## Consequences

### Positive

- One flag in the config replaces thirty per-page flags; a new static page needs
  no opt-in.
- Static pages skip the function entirely instead of relying on CDN-cached
  function responses.
- The middleware's prerendered bypass now covers the whole static surface
  (`middleware.ts:56`): prerendered responses skip negotiation and problem
  wrapping, keeping the `Link` header and the cache policy.

### Negative

- Prerendered output bypasses the discovery middleware's negotiation, so the
  markdown and JSON representations of static pages are unavailable from the
  static copy. This gap is already reported in `middleware-notes.md`; this ADR
  records it without fixing it.
- A route that needs request-time behaviour must remember to opt out; without
  `prerender = false` static output bakes its build-time response.
- The deploy still needs the SSR function for the six opt-outs, so ADR 007's
  single-filesystem constraint on the build output stands.
