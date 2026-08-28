# ADR-005: Keep orbit modules split

## Context

The orbit interaction (tag orbit visualiser) was originally a single large module. It was deliberately split into `orbit-engine`, `orbit-layout`, `use-orbit-state`, and `use-orbit-interaction` to keep each file navigable.

An architecture review suggested recombining them into one deep module (the "consolidate the orbit scatter" candidate). This was rejected.

## Decision

Keep the orbit interaction split across multiple modules. Each module owns one seam and stays small enough to read in one sitting. Depth comes from clean seams between focused modules, not from merging them into one file.

Future reviewers should not propose re-litigating this consolidation. If a module grows unwieldy, split it further along its internal seams — don't merge it back.

## Consequences

### Positive

- Each file fits on one screen
- One responsibility per module
- Easier to navigate than a single large file

### Negative

- Understanding a full interaction requires reading multiple files (acceptable trade-off)
