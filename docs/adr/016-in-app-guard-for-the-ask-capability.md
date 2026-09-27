---
status: accepted
---

# ADR 016: Guard the Ask Capability In-App, Without a Gateway

## Context

The ask pipeline calls two vendors directly, with no gateway, which deliberately
drops the provider-side spend limit and rate-limit layer. `POST /ask` is public and
unauthenticated, and the site's read surface advertises "not metered" — a claim that
cannot quietly extend to an endpoint that costs money per call. The limits must
therefore be enforced in-app against a persisted counter. Netlify Functions are
ephemeral and horizontally scaled, so an in-memory counter cannot hold them.

## Decision

- **Enforce only on `POST /ask`.** The GET read surface keeps its `RateLimit-*`
  headers as a published floor promise and stays unmetered.
- **Identity** is a salted hash of the client IP, with a server-side pepper. No
  cookie, token or `User-Agent`: the endpoint stays stateless and `curl`-callable,
  and no raw IP is stored.
- **Counters live in Netlify Blobs** (store `ask-guard`), with strong-consistency
  reads and ETag CAS. A per-client window, a global ceiling and the monthly budget
  share the store; the window and the month are part of each key, so they roll over
  by construction and nothing is ever "cleared".
- **Fail closed.** An unreachable store refuses with `RATE_LIMITED` rather than spend
  unmetered.
- **No cache in v1.** Deferred pending repeat-rate telemetry; if added, keys are
  hashed and corpus-versioned by deploy id, and raw question text is never stored.
- **No moderation vendor.** Safety stays on the gate's bounded classification plus a
  hardened answerer prompt.

## Considered Options

- **Redis / Upstash**: the better tool — atomic `INCR`, native expiry, strong
  consistency. Rejected for a second platform and secret when the zero-config,
  same-platform store suffices at this scale and bounded overshoot is absorbed by the
  budget's 10% reserve.
- **Cloudflare R2**: already in the stack, but a world-readable media origin with the
  wrong access model for private counters.
- **In-memory counters**: unreliable across ephemeral, horizontally scaled functions.

## Consequences

### Positive

- Vendor independence is preserved: no aggregator and no extra store in the path.
- One config module holds every tunable, so the guard can be retuned without touching
  the route.
- The read surface's "not metered" claim stays true and scoped.

### Negative

- Blobs has no atomic increment and no native TTL, so both are built by hand and a
  concurrent burst can overshoot slightly before CAS resolves.
- Counter reads must opt into strong consistency, or a limit can lag by up to 60
  seconds.
- A Blobs outage takes `POST /ask` down — by design, since the alternative is
  unbounded spend.
- The salted-IP hash is pseudonymous personal data and needs a line in the privacy
  notice.
