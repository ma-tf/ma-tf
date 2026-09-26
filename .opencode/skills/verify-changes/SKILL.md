---
name: verify-changes
description: Verify a front-end change in a real browser over the Chrome DevTools Protocol. Use when asked to verify, check, smoke-test, or validate a page or rendered behaviour after a change.
---

# Verify Changes

Verification happens in a **forked verification run**: a background subagent
drives a real browser over the Chrome DevTools Protocol (CDP) and returns a
**verdict**. The session keeps working while it runs.

## Fork the run (main session)

1. **Write the contract.** One line per assertion: what the change should make
   true. Take assertions from the diff, not the prose. Name the URL(s).
2. **Fork.** Launch the `general` subagent with `background: true`, passing the
   URL(s), the assertions, and this brief:

   > Load the `verify-changes` skill and run its **Child run** branch.
   > URL: <url>. Assertions: <list>.
   > Reuse a listening dev server; never start or stop one.

3. **Keep working.** Do not wait on the run. Continue the task; you are notified
   when it finishes.
4. **Deliver.** Preview the screenshot, then report one line per assertion with
   its verdict and evidence. On failure, fork a narrower run.

Done when a run is in flight and the session is not blocked, or when the user
has the verdict.

## Child run (forked verifier)

You own the browser. Return a verdict even when something fails.

1. **Reuse the server.** `curl -sf <url>` first. Start a server only if none
   listens, and leave it running.
2. **Load.** `browser.tabs.open` → `browser.navigate` → `browser.wait` for
   `load`, then for any text an assertion depends on.
3. **Probe.** `browser.console` at level `error` for exceptions;
   `browser.evaluate` for one assertion per script, returning a comparable
   value; `browser.screenshot` for the settled state.
4. **Report.** One line per assertion: `PASS <assertion> — <evidence>` or
   `FAIL <assertion> — <evidence>`. Quote console errors verbatim and give the
   screenshot path. End with the verdict.

## Rules

- **Fork every run.** Verification never executes inline in the main session.
- **The verifier never forks.** `general` cannot launch subagents; run the
  Child branch where it lands.
- **Assertions trace to the change.** Verify what the diff should make true.
- **Evidence, not impressions.** Every verdict carries a console line, an
  evaluated value, or a screenshot.
- **Leave servers as you found them.** See `docs/testing.md`.
