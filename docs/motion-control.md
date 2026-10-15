# Reduced motion and the motion control

- `prefers-reduced-motion: reduce` disables both parallax drivers in
  `src/lib/parallax.ts`, and each entrance and reveal utility in `global.css`.
- The mobile `Back to top` button (`src/lib/scroll-to-top.ts`) scrolls smoothly
  by default and jumps when the media query matches.
- The `data-motion` control is separate. `data-motion="skipped"` and
  `data-motion="revisit"` (ADR 019) disable only the page-load entrances;
  `skipped` also disables the scroll reveals. The parallax drivers are not
  gated by `data-motion` — the control is scoped to entrances and reveals,
  leaving parallax to its own reduced-motion handling.
- The typewriter on `/developers` is treated as an entrance: `startTypewriter`
  declines under reduced motion or any `data-motion` value, and the control can
  finish it at once (ADR 019).
- The control is a server-rendered component plus the deferred
  `src/lib/motion-control.ts`, so it decides skip/reset before React would
  hydrate; `global.css` picks the icon from `data-mode` and `data-motion`
  ([ADR 019](adr/019-replay-motion-control.md)).
- Scroll-driven motion is exempt from the 150ms budget of
  [ADR 011](adr/011-motion-timing-budget.md): `animate-fade-in-scroll` maps to
  scroll position, not time, as do the parallax drivers. `animate-reveal` is
  trigger-based rather than scroll-linked; its duration is declared at the call
  site (`animate-reveal-<ms>`) and is also exempt from the 150ms cap.
