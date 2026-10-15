# Logging emission and redaction

`src/lib/wide-event-middleware.ts`, the outermost handler chained by `sequence`
in `src/middleware.ts`, decides whether a finished request is logged:

- **API paths always emit.** `/ask` and `/mcp` (`isApiPath` in
  `src/lib/api-paths.ts`) are the cost-bearing surfaces, so every request is
  recorded whether it succeeds or fails.
- **Non-API paths emit on failure only.** A non-API response is emitted when its
  status is at or above 400. A successful page, asset or discovery resource is
  not logged.
- **A deferred response is emitted when its body ends.** A streaming `/ask`
  response calls `deferEmission()` and returns an SSE body. `wideEventMiddleware`
  sees the mark and wraps the body, calling `log(finish(event))` once the body is
  consumed or cancelled. If the body is never consumed, the wrapper never runs
  and the event is never emitted.

The middleware composes the two modules: for an ordinary response it calls
`log(finish(event, { status_code }))`; for a deferred body it logs from the
wrapper. A thrown error that reaches `wideEventMiddleware` is captured under
`error.phase: "middleware"` and finished as `status_code: 500`,
`outcome: "server_error"` before it is re-thrown. The deferred stream only
enriches the event (`outcome`, `ask.stream.*`) in its `finally`; it never logs.

## The line

`src/lib/log.ts` holds the one write:

```ts
export function log(event: WideEvent): void;
```

It is idempotent — an event is written once, however many times `log` is called
— and it passes through `shouldEmit`, the retention seam. `shouldEmit` currently
returns `true`, so every event is kept. When volume demands it, this is where
tail sampling belongs: always keep errors and slow requests, sample the rest.
Nothing else needs to change, because the event is already complete when the
decision is made.

`log` writes the event with `console.log(JSON.stringify(event))`, one line per
request on stdout. Netlify captures function stdout in its function logs, and a
log drain can forward those lines to a queryable store. The `environment`,
`deploy_id` and `commit_ref` fields come from Netlify's build environment
(`CONTEXT`, `DEPLOY_ID`, `COMMIT_REF`), so a line can be attributed to a deploy.

## Redaction

The event is a wire format, so the rule is to record shapes and sizes, never
content:

- The visitor's question is never logged; only `ask.question_length`.
- The generated answer is never logged; only `ask.answer.answer_length`.
- Source content is never logged; the gate records `source_count` and
  `top_relevance`, and the stream records counts.
- No client IP is logged. `clientIp` in `src/lib/rate-limit-middleware.ts` feeds
  only the salted hash that keys the counter; the event carries the limit name
  and decision, not the address.
- Provider errors are logged with `error.message` and `error.stack` because they
  are needed to diagnose a swallowed failure.
