# Lint

The linter, the static quality gate, and the size budget for the markdown files
agents read. See [testing.md](testing.md) for the test suite and
[vite-plus.md](vite-plus.md) for the toolchain.

## Lint speed

`vp run lint:bench` times `vp lint` (default 5 runs) and reports min, median and
max wall time. `--runs=<n>` changes the sample size; repeatable `--file=<path>`
flags bench a scoped run instead of the whole repo. WSL2 timings are noisy, so
compare medians and never bench two lints at once.

Per-rule timings, including JavaScript plugin rules:

```sh
vp lint --format=default --debug=timings
```

`--format=default` is required; without it the summary and the timings table are
omitted, and `--debug=timings` cannot be combined with other `--debug` options.
The table lists rule, time, relative share, calls and source (`native`,
`type-aware`, `js-plugin`), followed by a `JS plugin runtime` summary. Collecting
timings slows the run, so read it as a relative breakdown.

## Documentation budget

`docs/max-chars` caps every markdown file agents read at 5000 characters:
`docs/**/*.md`, plus `AGENTS.md` and `README.md`. The number is the rule's
`limit` option in `vite.config.ts`. `docs/vite-plus.md` is exempt because the
toolchain regenerates it. Split a file that outgrows the cap.

The rule reads those files off disk from its own lint pass, so its errors report
from `scripts/linter-rules/docs.mjs`, and it fires only on a full-repo
`vp check` or `vp lint`, not on a scoped run over a subset of paths.

## Static quality gate

`vpx fallow` exits 0 when clean and 1 on findings. The pre-push hook
runs the full `vpx fallow`.

- Fix the breach sections (Dead Code, Complexity), not the closing hint:
  the final "start with …" line names an advisory refactoring target,
  which can differ from the actual breaches.
- CRAP scores are estimated from export references; pass
  `--coverage <coverage-final.json>` for exact scores.
- For per-function detail, use the fallow MCP `check_health` and
  `inspect_target` tools, or
  `fallow health --complexity --complexity-breakdown --format json --quiet`.
