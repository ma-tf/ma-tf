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

## Emission

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

## Fields

The base fields are seeded by `beginRequest`; the rest are added by the stage
named in the source column.

| Field                             | Type    | Set by                                                          |
| --------------------------------- | ------- | --------------------------------------------------------------- |
| `timestamp`                       | string  | ISO 8601, at `beginRequest`                                     |
| `service`                         | string  | always `"m4t.tf"`                                               |
| `environment`                     | string  | `CONTEXT`, or `"development"`                                   |
| `request_id`                      | string  | `x-nf-request-id`, else `cf-ray`, else a UUID                   |
| `method`                          | string  | request method                                                  |
| `path`                            | string  | request pathname                                                |
| `deploy_id`                       | string  | `DEPLOY_ID`, when set                                           |
| `commit_ref`                      | string  | `COMMIT_REF`, when set                                          |
| `status_code`                     | number  | `finish`                                                        |
| `outcome`                         | string  | the terminal outcome                                            |
| `duration_ms`                     | number  | `beginRequest` to `finish`                                      |
| `error`                           | object  | `captureError`, see the error namespace                         |
| `ask.summarize`                   | boolean | whether a prose answer was requested                            |
| `ask.stream`                      | boolean | whether the client asked for SSE                                |
| `ask.question_length`             | number  | character count of the visitor's question                       |
| `ask.decision_gate.supported`     | boolean | whether the gate found answerable content                       |
| `ask.decision_gate.source_count`  | number  | sources above the relevance floor                               |
| `ask.decision_gate.top_relevance` | number  | top relevance probability, when any source passed               |
| `ask.decision_gate.duration_ms`   | number  | TypeSafe judgment duration                                      |
| `ask.answer.duration_ms`          | number  | OpenAI completion duration                                      |
| `ask.answer.model`                | string  | model that answered                                             |
| `ask.answer.input_tokens`         | number  | input tokens, when reported                                     |
| `ask.answer.output_tokens`        | number  | output tokens, when reported                                    |
| `ask.answer.answer_length`        | number  | character count of the generated answer                         |
| `ask.stream.completed`            | number  | stream steps that completed                                     |
| `ask.stream.results`              | number  | result items emitted                                            |
| `mcp.method`                      | string  | `Mcp-Method` header, when present                               |
| `mcp.name`                        | string  | `Mcp-Name` header, when present                                 |
| `error.message`                   | string  | always present                                                  |
| `error.name`                      | string  | `Error` instances and plain objects that carry one              |
| `error.stack`                     | string  | `Error` instances                                               |
| `error.phase`                     | string  | where it was captured: `middleware`, `stream_step` or `mcp_ask` |

`path` and `status_code` are always present: `path` is required at
construction, `status_code` is required by `finish`. `outcome` is set only by
the stage that decides it — `invalid_request`, `success`, `no_results`,
`unsupported_format`, `unsupported_mode`, `internal_error`, `aborted` or
`server_error` — and is absent when no stage classified the request; `aborted`
is a stream that ended without a terminal event.

The `ask.*` sub-namespaces come from `src/features/ask/ask.ts`,
`typesafe-ai.ts`, `answer.ts` and `nlweb-stream.ts`; `mcp.*` from
`src/pages/mcp.ts`; and `error.*` from `captureError`.

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
