# ADR 023: The MCP Endpoint Serves Modern and Legacy Clients

## Context

The 2026-07-28 revision of the Model Context Protocol replaced the classic
`initialize` handshake with a per-request envelope in `params._meta`. The
endpoint was served modern-only (`legacy: "reject"` on `createMcpHandler`), so
any client opening with a classic `initialize` — including standard MCP clients
and the `is-agentic` audit — received HTTP 400 `-32022` with the
self-contradictory payload
`supported: ["2026-07-28"], requested: "2026-07-28"`. The real cause was the
missing envelope, but the error read as a version mismatch and the audit
reported both `mcp-resource-listing` and `mcp-resource-quality` as "connection
failed".

## Decision

`src/features/mcp/handle-mcp.ts` passes `legacy: "stateless"` to
`createMcpHandler`. The same factory serves both eras: 2026-07-28 clients take
the envelope path, 2025-era clients opening with `initialize` are served
statelessly, with the same `ask` tool and the same resource catalogue, so the
two eras cannot drift. 2026-07-28 remains the canonical revision and the
OpenAPI description states the fallback.

Do not set `legacy: "reject"` without first widening the production smoke test
to cover the legacy handshake, or the failure recurs silently.

## Consequences

### Positive

- Standard MCP clients connect over `initialize` and can list and read
  resources; the `is-agentic` MCP checks can pass.
- One factory backs both eras, so tools and resources stay identical.
- The modern path is unchanged; modern-only clients see no difference.

### Negative

- Each legacy request gets a fresh server instance, so legacy sessions carry no
  server-side state across requests.
- The legacy path answers over Server-Sent Events, so clients must send
  `Accept: application/json, text/event-stream` on POST.
- `GET /mcp` returns 405: there is no server-to-client stream.

## Applied To

- `src/features/mcp/handle-mcp.ts`
- `src/features/mcp/handle-mcp.test.ts`
- `src/features/discovery/documents/openapi.ts`
- `.github/workflows/prod.yml`
