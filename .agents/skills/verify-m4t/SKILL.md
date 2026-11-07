---
name: verify-m4t
description: Screenshot, measure, geometry, verify behaviour — drive the real m4t.tf site in headless Chromium to prove a UI change or reproduce a report. Navigate, click, fill, snapshot, read console and network. Ships a feature map of every journey a visitor can take.
---

# Verify m4t.tf

One lever — `control-m4t.mjs` — plus a feature map. Every command prints one
JSON object. A failure carries `error` and `hint`; read the hint before retrying.

Browser evidence is a checkpoint, not a per-edit step. Probe when the
developer asks for a screenshot, measurement, or verification, when a claim
needs measurement the source cannot give, or at the end of a task before
claiming done ([docs/verification.md](../../../docs/verification.md)).
Cheaper rungs come first: a test, `vpx astro check`, `vp check`. A failing
test or a hunch is not a request.

## Launch

```sh
node .agents/skills/verify-m4t/control-m4t.mjs launch
```

- Attaches when something that is m4t.tf already answers at `--base`
  (default `http://localhost:4321`, or `M4T_BASE`). This is the normal path: the
  developer's dev server is reused, never restarted.
- Otherwise starts `vp run dev` in the background, which injects secrets through
  `secretspec`, and waits for the identity marker. Log:
  `.scratch/verify-m4t/dev-server.log`. The CLI supplies a `SECRETSPEC_REASON`,
  so an agent-invoked launch decrypts without prompting.
- `vp run dev` needs `~/.config/age/keys.txt`. Without it `launch` refuses and
  tells you to start the server yourself.
- Astro runs `astro dev` as a background daemon after `vpr generate`, so the
  wrapper exits before the site answers. `launch` records the daemon pid from
  `.astro/dev.json`; `stop` calls `vpx astro dev stop` only while that pid still
  matches.
- Never stop or kill a server you did not start ([docs/testing.md](../../../docs/testing.md)).
  `stop` only stops a server this CLI started.
- Motion sweeps — hover, scroll, timing — belong on `vp run preview` via
  `--base`, because HMR reloads destroy the execution context mid-sweep
  ([docs/verification.md](../../../docs/verification.md)).

## Doctor

```sh
node .agents/skills/verify-m4t/control-m4t.mjs doctor
```

Read-only: the server answers, the HTML carries `aria-label="m4t.tf home"`, dev
or built output, whether Ask is published, discovery reachability, the browser
session, who owns the server, and whether the age identity is present. Exit `0`
is healthy, `2` is unfit. Run it first whenever anything looks off.

## Drive

The first drive command starts a detached headless Chromium; later commands
reuse the same page. The session exits after ten idle minutes, on `cleanup`, or
when `control-m4t.mjs` itself changes.

| Command | Use |
| --- | --- |
| `goto <path> [--viewport=WxH] [--reduced-motion] [--theme=light\|dark]` | Navigate and wait for load, fonts, hydration and motion to settle |
| `snapshot [selector]` | ARIA snapshot — the cheapest way to see what is on screen |
| `screenshot <file> [--full] [--selector=SEL]` | Evidence; relative paths land in the evidence directory |
| `click <selector>` / `--text=TEXT` / `--role=ROLE --name=NAME` | Real pointer click, after scrolling the target into view |
| `fill <selector> <value>` | Type into an input, waiting for its island to hydrate |
| `press <key>` | `Control+k`, `Escape`, `Enter`, `Tab` |
| `hover <selector>` | Pointer-only affordances (prototype previews, embeds) |
| `scroll <selector>` / `--y=N` / `--pane=SEL --y=N` | Scroll into view, scroll the window, or scroll an inner pane |
| `wait --selector=SEL` / `--text=TEXT` / `--ms=N` | Wait for an observable end state |
| `text`, `count`, `attr`, `eval` | Assert what the page actually contains |
| `console [--clear]`, `requests [--clear]` | Console errors, network status and content types |
| `viewport <WxH>`, `media <reduced\|default>`, `theme <light\|dark>` | Environment control |

Handles that survive refactors:

- Header: `body > header a[aria-label="m4t.tf home"]`, `a[aria-label="CV"]`,
  `button[aria-label="Open command palette"]`, `button[aria-label="Toggle theme"]`,
  `[data-motion-control]`.
- Overlays: `[data-slot="dialog-content"][role="dialog"]`,
  `[data-slot="dialog-close"]`, `[data-slot="toast-title"]`.
- Blog inner pane: `[data-blog-scroll-target]`; section nav:
  `nav[aria-label="Section navigation"]`; mobile menu button named `menu`.
- Never key on `base-ui-*` or generated `id` attributes.

`goto` resets scroll to the top. `--reduced-motion` disables entrances, reveals,
parallax and the typewriter, which makes geometry and screenshots deterministic;
leave it off when the motion is what you are proving.

## Evidence

Standards, in order of what an agent gets wrong:

1. Exercise the real user path. No internal setters, no test-only endpoints.
2. Capture the action and the resulting state, not only the final screen.
3. Assert side effects too: `eval 'navigator.clipboard.readText()'`, `requests`
   for the write, `text` for the row that appeared.
4. Mocks only where a production boundary already isolates an external system.
5. A dry-run is verified by observing what it skipped, not by its name.

Evidence belongs in `.scratch/verify-m4t/evidence/` (gitignored). It survives
`cleanup`, so name files `feature-state.png` and quote the absolute path back.
Screenshot the viewport on pages with fixed chrome — `/blog`, `/photography`,
`/about`. `--full` expands the viewport and reflows pinned footers and parallax
into an image that misrepresents the page.

Ask costs one metered request (20 a minute, shared with `/mcp`). Send one
question per proof, not a sweep.

## Cleanup

```sh
node .agents/skills/verify-m4t/control-m4t.mjs cleanup
```

Stops the browser session and any dev server this CLI started, and leaves an
attached server alone. Evidence survives. Never kill by process name; kill what
you started.

## Helpers

- `node .agents/skills/verify-m4t/control-m4t.mjs --help` — full command list.
- `scripts/probe.mts` — one-shot geometry; prefer it when a single measurement
  settles the claim. Prefer this skill when screenshots or interaction evidence
  are needed. Never write ad-hoc measure scripts in `/tmp` or the repo root;
  put a reusable harness in `scripts/` instead.
- Feature map — [features/README.md](features/README.md).

## The map

| Feature | Routes | Proof |
| --- | --- | --- |
| [Command palette](features/command-palette.md) | any page with the header | Selecting a page routes; an action shows its toast and side effect |
| [Blog reading](features/blog-reading.md) | `/blog`, `/posts/<slug>`, `/tags/<tag>` | The pane scrolls, a post opens, a tag pill lands on its tag page |
| [Photography lightbox](features/photography-lightbox.md) | `/photography` | A frame opens, the caption toggles, the dialog closes |
| [Ask](features/ask.md) | `/about` (Questions card), `POST /ask` | A question returns prose and sources from published pages |
| [Discovery surface](features/discovery-surface.md) | `/llms.txt`, `/openapi.json`, `/mcp`, `/.well-known/*` | Each resource answers with its declared media type |

Not mapped yet: `/music`, `/vignettes/<slug>`, `/graphics`, `/cv`,
`/contact`, `/privacy`, `/404`, `/500`, `/prototypes/*`. Add a file as you prove
one; a proof that drives only a convenient entry point is incomplete when the map
lists others.

Maintenance: `maintain-verification-skill` keeps this map honest. It sweeps the
source per feature, runs one live pass, and ships only proven corrections. Never
weaken a journey to make it pass — record the drift in the feature file's Gotchas
instead.
