# Middleware branches

| #   | Guard                                  | Location            | Result                                                                 |
| --- | -------------------------------------- | ------------------- | ---------------------------------------------------------------------- |
| 1   | `isPrerendered`                        | `middleware.ts:56`  | `next()`, bypasses preflight, negotiation and problem wrapping         |
| 2a  | resource path and method not GET/HEAD  | `problems.ts:193`   | 405 problem+json with `Allow`, bypasses problem wrapping               |
| 2b  | `Accept` set and no supported type     | `problems.ts:200`   | 406 problem+json, bypasses problem wrapping                            |
| 3   | agent skill artifact path              | `middleware.ts:63`  | `next()` untouched, still problem-wrapped                              |
| 4a  | path ends `.md`                        | `negotiation.ts:84` | `markdown-suffix`                                                      |
| 4b  | catalogued resource and JSON preferred | `negotiation.ts:88` | `json-document` when the media type is JSON, else `json-descriptor`    |
| 4c  | markdown preferred                     | `negotiation.ts:95` | `markdown-accept`                                                      |
| 4d  | otherwise                              | `negotiation.ts:97` | `html`                                                                 |
| 5   | `status >= 400`                        | `middleware.ts:67`  | `problemResponse`                                                      |
| 6   | non-API path                           | `middleware.ts:86`  | `Link`                                                                 |
| 7   | API path with a configured limit       | `middleware.ts:69`  | `enforceRateLimit` returns `{ limited, headers }`                      |
| 8   | non-API response                       | `cache.ts:11`       | 200 GET/HEAD cached with `durable` and `Vary: Accept`, else `no-store` |

The four kinds resolve as follows:

- `markdown-suffix` — the catalogue descriptor for the rewritten path, else a
  turndown of the target (`resource-markdown.ts:30`, `middleware.ts:38`).
- `markdown-accept` — a turndown of `next()` with `Vary: Accept`
  (`middleware.ts:42`).
- `json-document` — `next()` re-typed as `application/json`, so a JSON resource
  is forwarded as its own document (`middleware.ts:45`).
- `json-descriptor` — `Response.json(describeResource(...))`, a synthesised
  descriptor for a resource whose own media type is not JSON
  (`middleware.ts:48`, `resource-json.ts:27`).
- `html` — `next()`.

`problemResponse` (`problems.ts:180`) prefers JSON, then markdown, then
problem+json when the path is a resource (`/.well-known/*`, catalogued
resources) or the client does not explicitly prefer HTML; otherwise it passes
the original error through with `Vary: Accept`. `*/*` is not an HTML preference
— it expresses no preference, so it receives problem+json.
