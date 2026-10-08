# ADR 022: The Motion Control Runs Before Hydration

## Context

[ADR 017](017-motion-skip-control.md) and
[ADR 019](019-replay-motion-control.md) put the skip/reset control in a React
island (`.tsx`) hydrated with `client:load`, because the entrance animations are
plain CSS that start at first paint and an island rendered only on the client
would arrive after them.

`client:load` still leaves a floor under the control. Its state — the set of
running entrance animations, `document.documentElement.dataset.motion`, and
`sessionStorage["visited-pages"]` — is a pure function of the DOM, and the
control is only useful for the first couple of seconds of a page view. On the
`/about` entrance, for example, the entrance finishes at roughly 2.5s while React
mounts at roughly 1.5s on a desktop dev server, and on a slower device hydration
is the term that grows. The entrance decision itself is already made before
paint by the inline script in `Layout.astro`
([ADR 018](018-revisit-entrance-skip.md)), which sets `data-motion="revisit"`;
the control that reacts to it does not need React to do the same.

## Decision

The control becomes a server-rendered Astro component,
`src/components/MotionControlButton.astro`, plus an imperative module,
`src/lib/motion-control.ts`, run from the component's `<script>` — a deferred
module, so far earlier than React hydration. The module ports `useMotionControl`
unchanged: it selects `[data-motion-control]`, hides the control when motion is
reduced or no entrance exists, shows reset when a `data-motion` value is already
present, and otherwise watches the entrance animations (`getAnimations()`), the
typewriter start/end events, and a 5s fallback before flipping to reset.

The two Phosphor icons are imported from `@phosphor-icons/react/ssr`, so the
component renders static SVG server-side with no React client runtime.

The icon crossfade moves from class strings supplied by React to CSS in
`global.css`, keyed on `[data-motion-control][data-mode]` with a
`html[data-motion]` branch. Because `data-motion="revisit"` is set before paint,
a revisited page shows the reset icon with no skip-icon flash — the flash noted
in [ADR 019](019-replay-motion-control.md). Reduced motion hides the control with
a media query instead of a mount-time check, so it never flashes there either.

`src/hooks/use-motion-control.ts` is deleted; `src/hooks/use-reduced-motion.ts`
stays, because the tag orbit uses it.

## Consequences

### Positive

- The reset state no longer waits on React hydration; it flips from the same
  small script that already decides the entrance.
- The revisit and reduced-motion cases render correctly from CSS alone, removing
  the skip-icon flash that [ADR 019](019-replay-motion-control.md) accepted.
- The control ships as static HTML plus a small module, with no React in the
  header.

### Negative

- The port drops the hook's effect cleanup (`clearTimeout`,
  `removeEventListener`) and `running.clear()` on purpose: the deferred script
  runs once per document and the `started` guard makes repeat calls a no-op.
  `running` is a fresh set per document, and the fallback timeout plus the
  typewriter listeners die with the document on full navigation — there is no
  React unmount or StrictMode remount to clean up after.
- The control's markup, logic and styling now live in `.astro`, `.ts` and
  `global.css` rather than in one component file.
- The auto-hide sampling and fallback remain best-effort, unchanged from
  [ADR 017](017-motion-skip-control.md).
- The control still cannot shorten the entrance itself; on a fast machine the
  entrance remains the gate, and the gain appears where hydration was slower.

## Applied To

- `src/components/MotionControlButton.astro`
- `src/lib/motion-control.ts`
- `src/lib/typewriter.ts`
- `src/components/Header.astro`
- `src/styles/global.css`
- `src/layouts/Layout.astro`
