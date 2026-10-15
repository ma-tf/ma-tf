# Logging fields

The base fields are seeded by `beginRequest`; the rest are added by the stage
named in the source column.

| Field                             | Type    | Set by                                                                 |
| --------------------------------- | ------- | ---------------------------------------------------------------------- |
| `timestamp`                       | string  | ISO 8601, at `beginRequest`                                            |
| `service`                         | string  | always `"m4t.tf"`                                                      |
| `environment`                     | string  | `CONTEXT`, or `"development"`                                          |
| `request_id`                      | string  | `x-nf-request-id`, else `cf-ray`, else a UUID                          |
| `method`                          | string  | request method                                                         |
| `path`                            | string  | request pathname                                                       |
| `deploy_id`                       | string  | `DEPLOY_ID`, when set                                                  |
| `commit_ref`                      | string  | `COMMIT_REF`, when set                                                 |
| `status_code`                     | number  | `finish`                                                               |
| `outcome`                         | string  | the terminal outcome                                                   |
| `duration_ms`                     | number  | `beginRequest` to `finish`                                             |
| `error`                           | object  | `captureError`, see the error namespace                                |
| `ask.summarize`                   | boolean | whether a prose answer was requested                                   |
| `ask.stream`                      | boolean | whether the client asked for SSE                                       |
| `ask.question_length`             | number  | character count of the visitor's question                              |
| `ask.decision_gate.supported`     | boolean | whether the gate found answerable content                              |
| `ask.decision_gate.source_count`  | number  | sources above the relevance floor                                      |
| `ask.decision_gate.top_relevance` | number  | top relevance probability, when any source passed                      |
| `ask.decision_gate.duration_ms`   | number  | TypeSafe judgment duration                                             |
| `ask.answer.duration_ms`          | number  | OpenAI completion duration                                             |
| `ask.answer.model`                | string  | model that answered                                                    |
| `ask.answer.input_tokens`         | number  | input tokens, when reported                                            |
| `ask.answer.output_tokens`        | number  | output tokens, when reported                                           |
| `ask.answer.answer_length`        | number  | character count of the generated answer                                |
| `ask.stream.completed`            | number  | stream steps that completed                                            |
| `ask.stream.results`              | number  | result items emitted                                                   |
| `mcp.method`                      | string  | `Mcp-Method` header, when present                                      |
| `mcp.name`                        | string  | `Mcp-Name` header, when present                                        |
| `error.message`                   | string  | always present                                                         |
| `error.name`                      | string  | `Error` instances and plain objects that carry one                     |
| `error.stack`                     | string  | `Error` instances                                                      |
| `error.phase`                     | string  | where it was captured: `middleware`, `ask`, `stream_step` or `mcp_ask` |

`path` and `status_code` are always present: `path` is required at
construction, `status_code` is required by `finish`. `outcome` is set only by
the stage that decides it — `invalid_request`, `success`, `no_results`,
`unsupported_format`, `unsupported_mode`, `internal_error`, `aborted` or
`server_error` — and is absent when no stage classified the request; `aborted`
is a stream that ended without a terminal event.

The `ask.*` sub-namespaces come from `src/features/ask/ask.ts`,
`typesafe-ai.ts`, `answer.ts` and `nlweb-stream.ts`; `mcp.*` from
`src/pages/mcp.ts`; and `error.*` from `captureError`.
