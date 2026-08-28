# ADR 004: Always Use Path Aliases

All imports must use path aliases defined in `tsconfig.json`. Relative imports (`./` and `../`) are never allowed. The `no-restricted-imports` rule in `vite.config.ts` enforces this and runs via `vp check`.
