# Secrets

The tools that keep secrets out of the repository. The code is the source of
truth for what exists and where.

- **Betterleaks** — scans staged content for secret patterns before each commit,
  in `.vite-hooks/pre-commit`. Pinned to v1.9.0:
  `go install github.com/betterleaks/betterleaks@v1.9.0`.
- **TruffleHog** — verifies credentials in commits pushed to `master`
  (`dev.yml`) and audits full history weekly (`secrets.yml`).
- **secretspec** — declares what the project requires, in `secretspec.toml`, and
  resolves it from `secrets.age`, an age-encrypted file committed alongside the
  code. The identity is `~/.config/age/keys.txt`, never in the repository. The
  recipient is public:

  ```
  age12gp229puan78qc3kqs2fljkrzntvsf86xc8hwrz63n9g9gqszvjq2dqnxj
  ```

  Values are injected per command, which is also how a build or dev server gets
  the ask keys:

  ```
  secretspec run -p "age://secrets.age?identity=$HOME/.config/age/keys.txt" -- vp run build
  ```

`.env` holds public build config only and is committed. No R2 credentials exist
anywhere: assets are published through the Cloudflare dashboard. CI takes public
config from GitHub `vars` and its two deploy secrets from GitHub `secrets`,
asserted in `prod.yml`.

`git commit --no-verify` bypasses the hook, so this is a guardrail, not
enforcement.
