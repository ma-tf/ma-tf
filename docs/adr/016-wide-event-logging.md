# ADR 016: Wide-Event Logging

## Context

`/ask` and `/mcp` call two paid providers: a TypeSafe judgment and an OpenAI
completion. When either failed, the failure was swallowed. The stream mapped a
rejected step to a generic `INTERNAL_ERROR` document and the MCP tool returned
`failureResponses.INTERNAL_ERROR`, both without recording why. The only logging
in the codebase was three ad-hoc `console.warn` strings, so a provider outage
was invisible unless a client reported it, and there was no way to attribute
spend, latency or failure to a single request.

## Decision

One wide event per backend request, captured by `src/lib/wide-event.ts` and
carried by `AsyncLocalStorage`; `src/lib/log.ts` writes the finished event as one
JSON line. The outermost middleware, `wideEventMiddleware` in
`src/lib/wide-event-middleware.ts`, opens the event with `beginRequest`, runs the
request inside `runWith`, and composes `log(finish(event))` after the response;
`src/middleware.ts` chains it in front of the discovery middleware with
`sequence`. API paths (`/ask`, `/mcp`) are always emitted; non-API paths are
emitted only when the response status is at or above 400. A streaming `/ask`
response defers emission: the middleware wraps the body and logs the event once
it has been consumed, so the stream only enriches it. See
[logging.md](../logging.md).

Each stage enriches the event instead of logging on its own:

- `src/lib/rate-limit-middleware.ts` returns the `429` response when a client is
  over quota, so the event records `status_code: 429`. It keeps its own
  `console.warn` when the check fails open: no client IP, a missing
  `RATE_LIMIT_SALT`, or a blob-store error.
- `src/features/ask/typesafe-ai.ts` records the judgment duration; `answer.ts`
  records the completion duration, model, token counts and answer length.
- `src/features/ask/nlweb-stream.ts` and `src/features/mcp/ask.ts` capture a
  provider error with `captureError` before returning the generic failure
  document, and record the stream counts.
- `src/features/ask/handle-ask.ts` records the question length, whether the
  request streamed and whether a prose answer was requested.

Redaction is by construction: the visitor's question and the generated answer
are never fields, only `question_length` / `answer_length` and counts, and no
client IP is logged. The client IP feeds only the salted hash that keys the rate
limiter.

The emitted object uses snake_case keys because the line is a wire format read
by an operator and a log drain, not an internal TypeScript type.

`shouldEmit` in `src/lib/log.ts` currently keeps every event. It is the seam for
tail sampling later: always keep errors and slow requests, sample the rest.

## Consequences

### Positive

- Every API request and every non-API failure produces one correlated JSON line
  with `request_id`, path, status and duration, plus an outcome when a stage set
  one.
- Provider failures are recorded with `error.message` and `error.stack` even
  though the client still receives a generic failure document.
- The two cost-bearing stages are timed and token-counted, so spend can be
  attributed to a request.
- A rate-limited request is visible as a `429` status code, without the limiter
  threading a decision through the logging layer.
- Retention policy lives in one function, `shouldEmit`.

### Negative

- Every non-API `4xx` now emits, so bot 404 scanning becomes visible as log
  volume rather than staying silent.
- A streaming event is only emitted if the stream body is consumed; an abandoned
  stream leaves no line.
- The streaming path assumes the stream is built inside the request scope:
  `runStream` and `failureStream` capture the event there and pass it explicitly
  to `enrich`, `captureError` and `finish`, so the counts no longer depend on the
  async context surviving into the generator.
- No sampling is active, so every request is a line and retention is unbounded
  by the logger itself.
- The snake_case shape is a compatibility surface: renaming or dropping a field
  breaks downstream queries.
