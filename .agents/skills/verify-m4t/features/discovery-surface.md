# Discovery surface

The machine-readable resources the site publishes for agents, and the negotiation
that serves each page twice.

## Sub-features

- `llms`: `/llms.txt` site guide, `/llms-full.txt` archive, and the section
  guides `/api/llms.txt`, `/blog/llms.txt`, `/cv/llms.txt`,
  `/developers/llms.txt`.
- `openapi`: `/openapi.json`, the contract for the site's JSON resources; the
  `/developers` page lists every resource with its media type.
- `catalogues`: `/.well-known/ai-catalog.json`, `/.well-known/ard.json`,
  `/.well-known/api-catalog`, `/.well-known/agent-skills/index.json` and its
  `/.well-known/agent-skills/<name>/SKILL.md` documents,
  `/.well-known/mcp`, `/.well-known/mcp/server-card.json`, `/server.json`,
  `/mcp-catalogue.json` (dev only).
- `feeds`: `/sitemap.xml`, `/rss.xml`, `/schemamap.xml`, `/robots.txt`.
- `negotiation`: any page as markdown through `Accept: text/markdown` or a `.md`
  suffix; JSON resources through `Accept: application/json`.
- `mcp`: `POST /mcp` speaking both the 2026-07-28 envelope and the legacy
  initialise handshake; `POST /ask` for the NLWeb question shape.

## How to get to it (user POV)

A person reaches this from `/developers`, which lists every resource path, media
type and title. Agents read `llms.txt` first and follow the links it names.

## Driving it with control-m4t

Preconditions:

- The site answers at the base you pass, and `doctor` reports it healthy.
- `PUBLIC_ASK_ENABLED=true` for `/mcp`, `/ask`, `/server.json` and the MCP
  catalogues.
- The dev server, not a built preview, for `/mcp-catalogue.json`.

Most of this surface is cheaper over HTTP than through a browser. Assert status,
media type and a body marker:

```sh
for p in /llms.txt /llms-full.txt /openapi.json /sitemap.xml /rss.xml /schemamap.xml /.well-known/agent-skills/index.json; do
  curl -sS -o ".scratch/verify-m4t/evidence$(echo $p | tr / _)" \
    -w "$p %{http_code} %{content_type}\n" "http://localhost:4321$p"
done
curl -sS -H 'Accept: text/markdown' -o /dev/null -w '/about %{http_code} %{content_type}\n' http://localhost:4321/about
curl -sS -H 'Accept: application/json' -o /dev/null -w '/about json %{http_code} %{content_type}\n' http://localhost:4321/about
```

End state: `text/plain` for the llms pair, `application/vnd.oai.openapi+json`
for OpenAPI, `application/xml` for the feeds, `application/json` for the Agent
Skills index, and `text/markdown` for the markdown twin.

`/mcp` needs a POST and both media types in `Accept`:

```sh
curl -sS -X POST http://localhost:4321/mcp \
  -H 'Content-Type: application/json' \
  -H 'Accept: application/json, text/event-stream' \
  -d '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2025-11-25","capabilities":{},"clientInfo":{"name":"probe","version":"1"}}}'
```

For the browser path, `/developers` shows the catalogue:

```sh
node .agents/skills/verify-m4t/control-m4t.mjs goto /developers --viewport=1280x900
node .agents/skills/verify-m4t/control-m4t.mjs count 'main a[href^="/"]'
node .agents/skills/verify-m4t/control-m4t.mjs screenshot developers.png
```

## Gotchas

- `/mcp-catalogue.json` is dev-only and 404s in a built preview.
- `/server.json`, `/.well-known/mcp`, the server card, `/mcp` and `/ask` all 404
  when `PUBLIC_ASK_ENABLED` is off. Check the flag before calling it a regression.
- `/mcp` rejects a Host or Origin that is not `m4t.tf` or localhost.
- `/vignettes` redirects to the first enabled vignette; the redirect is hosting
  configuration, not a page.
- A page's HTML, markdown and JSON forms are negotiated, so a raw `curl` without
  `Accept` gives HTML. Name the media type you mean in every assertion.
