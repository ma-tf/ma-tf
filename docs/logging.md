# Logging

Two modules share the backend logging: `src/lib/wide-event.ts` captures one wide
event per backend request — a single plain object, enriched by each stage that
handles the request — and `src/lib/log.ts` writes it once, as one JSON line, when
the request finishes. The line is the unit an operator reads.
`src/lib/wide-event-middleware.ts` is the only place that uses both: it opens the
event, decides whether the request is worth a line and emits it. The vocabulary
here matches [GLOSSARY.md](GLOSSARY.md).

## The wide event

`src/lib/wide-event.ts` is the context capture: it owns the event object and the
`AsyncLocalStorage` scope that carries it, so any awaited callee can enrich the
event without it being threaded through arguments.

- `beginRequest(request, { path, method })` seeds the base fields and starts the
  duration clock.
- `runWith(event, work)` runs the rest of the request inside the scope.
- `current()` returns the ambient event, or `undefined` outside a `runWith`.
- `enrich(fields, event?)` deep-merges fields into the event, the ambient one by
  default. Nested plain objects merge; arrays and scalars replace.
- `captureError(error, context?, event?)` records the failure under `error`,
  merging the call-site `context` with the serialised error: name, message and
  stack for an `Error`, message only for a string.
- Both accept an optional explicit `event` for code that runs after the request
  scope has closed, such as the SSE stream.
- `deferEmission()` marks the event so the middleware logs it when the response
  body ends, for a streaming response whose body outlives the middleware call.
- `isDeferred(event)` reads that mark.
- `finish(event, { status_code, outcome })` stamps the status, derives
  `duration_ms` and returns the event. It does not write anything.

A call to `enrich`, `captureError` or `deferEmission` outside a `runWith` is a
no-op, so a callee can enrich unconditionally.

## Also in this topic

- [Logging emission and redaction](logging-emission.md) — when a request is logged, the line it writes, and what is scrubbed.
- [Logging fields](logging-fields.md) — the field vocabulary of the wide event.
