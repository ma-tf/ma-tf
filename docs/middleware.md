# Middleware

`src/middleware.ts` is a thin shim that chains two handlers with `sequence`.
The outermost, `wideEventMiddleware` in `src/lib/wide-event-middleware.ts`,
opens one wide event per request and closes it after the response (see
[logging.md](logging.md) and [ADR 016](adr/016-wide-event-logging.md)). The
inner `discoveryMiddleware` is a shim over `src/features/discovery/` (see
[ADR 008](adr/008-single-discovery-module.md)): it advertises the discovery
surface with response headers, negotiates the representation of a page or
discovery resource, converts errors into RFC 9457 problems, meters API
paths, and applies the cache policy from `cache.ts` (see
[ADR 024](adr/024-discovery-responses-cache-at-the-cdn.md)). The vocabulary
below matches [GLOSSARY.md](GLOSSARY.md).

## Request flow

```mermaid
flowchart TD
    A([onRequest]) --> SEQ["sequence(wideEventMiddleware, discoveryMiddleware)"]
    SEQ --> EV["wideEventMiddleware:<br/>beginRequest + isApiPath"]
    EV --> RW["runWith(event)"]
    RW --> API{api path?}

    API -- yes --> RLC{apiRateLimitFor?}
    RLC -- yes --> ENF[enforceRateLimit]
    ENF --> LIM{limited?}
    LIM -- yes --> X
    LIM -- no --> NXT["await next()"]
    RLC -- no --> NXT
    NXT --> X
    NXT -. "streaming /ask" .-> DEF["deferEmission()"]

    API -- no --> B[respond]
    B --> C{isPrerendered?}
    C -- yes --> PRE["await next()<br/>skips negotiation + problem wrap"] --> W
    C -- no --> D["read Accept + pathname"]
    D --> E{preflightResponse}
    E -- "resource & method not GET/HEAD" --> M405["problem+json 405<br/>Allow: GET, HEAD"] --> W
    E -- "Accept set & no supported type" --> M406["problem+json 406"] --> W
    E -- none --> F{agent-skill SKILL.md?}
    F -- yes --> PASS
    F -- no --> G["selectRepresentation(url, accept)"]
    G --> H{kind}
    H -- markdown-suffix --> I{catalogue descriptor?}
    I -- hit --> J["markdown descriptor"] --> Q
    I -- miss --> K["turndown next(target)<br/>Vary off"] --> Q
    H -- markdown-accept --> L["turndown next()<br/>Vary: Accept"] --> Q
    H -- json-document --> N["next() re-typed application/json"] --> Q
    H -- json-descriptor --> O["descriptor JSON + Vary"] --> Q
    H -- html --> PASS
    PASS["await next() - route or static asset"] --> Q
    Q{"status >= 400?"}
    Q -- no --> R[response]
    Q -- yes --> S{problemResponse}
    S -- prefersJson --> T["problem+json"] --> W
    S -- prefersMarkdown --> U["markdown problem"] --> W
    S -- "resource or !prefersHtml" --> T
    S -- "html browser" --> V["passthrough<br/>Vary: Accept"] --> W
    R --> W
    W["set Link header"] --> W2["applyCacheHeaders"] --> X

    X{"api or status >= 400,<br/>not deferred?"}
    X -- yes --> FIN["log(finish(event, status_code))<br/>one JSON line"] --> RET([Response])
    X -- no --> RET
    DEF -.-> OWN["stream generator<br/>log(finish(event)) in finally"]
    OWN -.-> RET
```

## Also in this topic

- [Middleware branches](middleware-branches.md) — every guard in the flow and its result.
- [Middleware notes](middleware-notes.md) — cross-cutting constraints on the flow.
