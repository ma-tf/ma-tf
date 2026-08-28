# ADR 003: No `transition: all`

## Context

`transition: all` (Tailwind `transition-all`) animates every property that
changes, including expensive layout properties and instant ones such as focus
rings. This causes janky animations, extra latency, and wasted renders on every
interaction.

The `react-doctor/no-transition-all` rule (warning) enforces this, run on
pre-push and via the Fallow `react-doctor` plugin.

## Decision

Never use `transition-all`. Name the specific properties being animated, using
the Tailwind utilities `transition-colors`, `transition-opacity`, or
`transition-transform`, or an arbitrary value such as
`transition-[opacity_200ms,transform_200ms]`.

## Consequences

### Positive

- Animations animate only what is intended, avoiding layout thrash
- Focus rings and other instant state changes stay instant

### Negative

- Properties must be listed explicitly, which is more verbose than
  `transition-all`

## Applied To

- `blog-page.tsx` - `transition-all` → `transition-transform`
