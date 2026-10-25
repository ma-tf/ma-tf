# Ask

The site answering a visitor's question from its published content, in the FAQ
section of the home page and over `POST /ask`.

## Sub-features

- `composer`: the input in the FAQ section; the submit button stays disabled
  until the draft is non-empty.
- `answer`: prose in `.answer-content` plus a list of source links.
- `states`: `Thinking` while pending, `Answer ready` when done, a refusal for
  off-corpus questions, `Couldn't reach the site agent.` with `Try again` on
  failure.
- `units`: every submit appends another question-and-answer unit; earlier units
  stay in the list.
- `endpoint`: `POST /ask` with `{ "query": { "text": "…" }, "prefer": { "mode": "summarize" } }`,
  or `"list"` for results without prose.
- `mcp`: the same decision gate backs the `ask` tool on `/mcp`.

## How to get to it (user POV)

Scroll to the FAQ on the home page. Type a question into "Ask about this site…"
and click the arrow, or press Enter once the button is enabled. Read the answer
and follow the source pills.

## Driving it with control-m4t

Preconditions:

- The home page is loaded and `doctor` reports Ask as enabled.
- `TYPESAFE_API_KEY` and `OPENAI_API_KEY` are resolved by the running server.
- Fewer than 20 questions have been sent this minute.

```sh
node .agents/skills/verify-m4t/control-m4t.mjs goto / --viewport=1280x900
node .agents/skills/verify-m4t/control-m4t.mjs scroll 'input[aria-label="Ask about this site"]'
node .agents/skills/verify-m4t/control-m4t.mjs fill 'input[aria-label="Ask about this site"]' 'What does Matt work on?'
node .agents/skills/verify-m4t/control-m4t.mjs eval 'document.querySelector("form:has(input[aria-label=\"Ask about this site\"]) button[aria-label=\"Ask\"]").disabled'
node .agents/skills/verify-m4t/control-m4t.mjs click 'form:has(input[aria-label="Ask about this site"]) button[aria-label="Ask"]'
node .agents/skills/verify-m4t/control-m4t.mjs wait --selector='.answer-content' --timeout=60000
node .agents/skills/verify-m4t/control-m4t.mjs text '.answer-content'
node .agents/skills/verify-m4t/control-m4t.mjs count '.answer-content ~ ul a'
node .agents/skills/verify-m4t/control-m4t.mjs screenshot ask-answered.png
```

End state: the submit button reports `false` for `disabled` (React state synced),
`.answer-content` is visible with non-empty prose, and at least one source link
follows it. The prose itself varies between runs; assert its shape, not its
wording.

Endpoint proof, no browser:

```sh
curl -sS -o .scratch/verify-m4t/evidence/ask.json \
  -D .scratch/verify-m4t/evidence/ask.headers \
  -H 'Content-Type: application/json' -H 'Accept: application/json' \
  -d '{"query":{"text":"What does Matt work on?"},"prefer":{"mode":"list"}}' \
  http://localhost:4321/ask
```

End state: 200, a `results` array with `WebPage` entries, and rate-limit headers.

## Gotchas

- The panel is `client:visible`. It does not hydrate until it intersects the
  viewport, so scroll it in and let `fill` wait; a bare `press` on an unhydrated
  composer loses the keystrokes.
- Submitting before hydration leaves the DOM value in place but React state
  empty, so the submit button stays disabled. The `disabled` assertion above
  catches exactly that.
- `GET /ask` is 404 even when Ask is enabled; only POST is routed.
- One question costs one metered request, 20 a minute per client, shared with
  `/mcp`. Do not sweep.
- Needs `TYPESAFE_API_KEY` and `OPENAI_API_KEY`. Without them the UI shows the
  error state, which is a configuration fault, not an app regression.
- A refusal is a valid end state for an off-corpus question. Do not treat it as
  a failure, and do not reword the question until prose appears.
