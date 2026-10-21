# Verification

Verification is the evidence that settles a claim. The cheap evidence runs
in-process: the test suite, the type checker, the linter. The expensive evidence
is a probe — a dev or preview server, a headless browser, a screenshot. A probe
buys measured geometry at the price of a server, slow and flaky feedback (HMR
reloads, timing) and the developer's time, so it settles only what the cheap
evidence cannot.

## Prefer the cheapest thing that answers

Work down this list and stop at the first rung that can settle the question:

1. A unit test or type check.
2. Format, lint, `astro check`.
3. Start the app and probe it.

If a visual claim can be pinned down as a unit test, write the unit test — it is
cheaper and it stays. Do not start the app to confirm something the source, the
type checker or a test already answered.

## A probe settles a prediction

Read the component, its classes and their breakpoint variants first, then state
the claim and the value you expect: the gutter, the width, the transform, the
wrapping, and the declaration that sets it. A probe with no stated expectation
has nothing to settle.

## When starting the app is justified

Start the app at a checkpoint — the natural end of a task, when the developer
asks, or before claiming done — not after every edit:

- the developer asked for it;
- the claim needs measurement the source cannot give: wrapping, overlap between
  boxes, viewport-relative sizing, motion over time;
- the prediction was wrong in a way the source cannot explain.

There is nothing to probe before an edit, and nothing to probe after every
edit. A layout question is not a reason to start the app. Iterate against the
source and the in-process checks; probe once when the task reaches its
checkpoint.

When a probe is warranted:

- Probe the smallest thing that shows the point. `scripts/probe.mts` handles
  one-shot geometry; [testing.md](testing.md) documents its flags.
- Put a reusable harness in `scripts/` beside it, not in a temporary directory.
- Run multi-step sweeps — hover, scroll, timing — against `vp run preview`, not
  the dev server. HMR reloads destroy the execution context mid-sweep, which
  reads as a bug in the thing you are probing.
- Sweep one writer at a time: hold project-wide commands until parallel writers
  have stopped.

## What the guardrails already run

| Stage                        | Runs                                                                                             |
| ---------------------------- | ------------------------------------------------------------------------------------------------ |
| `pre-commit`                 | `vp staged --fail-on-changes`                                                                    |
| `pre-push`                   | `vp run check:ask-corpus`, `vpx react-doctor -y`, `vpx fallow`                                   |
| `dev.yml` (push to `master`) | `vpx astro sync`, `vp run check:ask-corpus`, `vp check`, `vpx fallow`, `vp test`, `vp run build` |
| `prod.yml` (`v*` tag)        | The dev sequence, then the deploy and a live smoke test                                          |

Hand-running these in a session duplicates them. Run the narrowest check that
supplies the signal you actually lack.

## Regenerating the corpus

`vp run check:ask-corpus` compares the committed corpus with its sources and
needs no secrets. Regenerating it renders pages from a running dev server, so it
needs the ask keys: run it under the secrets profile in
[secrets.md](secrets.md), or the run fails with `TYPESAFE_API_KEY is missing`.

## Claiming done

State what ran and what did not. Never present a skipped check as evidence.
