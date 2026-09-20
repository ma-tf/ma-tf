# ADR 009: Photography Derivatives Are Generated Out-of-Band and Served from R2

## Context

The photography grid rendered every image through `astro:assets`. `getImage()` was
called twice per photo with `inferSize: true`, so building or running the site
downloaded each original from the R2 bucket and ran it through sharp. The originals
are camera exports: 2.5 MB to 25 MB each, 24 of them, roughly 144 MB in total. They
carry no `Cache-Control`, so Cloudflare reports `DYNAMIC` and every cache miss pays
the full download again.

Every other image on the site — blog backgrounds, music, tags, project art — is a
pre-made `.webp` served directly from the bucket. Photography was the only feature
still asking the build to transform anything.

## Decision

Photography images are served directly from R2 as pre-generated webp derivatives.
The originals stay in the bucket as the archive.

Generation happens out-of-band, before upload, using a throwaway local script. Two
derivatives are produced per original:

- `photography/<name>.webp` — full size at native resolution, quality 87.
- `photography/<name>_thumb.webp` — 480×480 centre crop, quality 80, used in the grid.

The content `image` field holds the derivative base (`photography/foo`). The page
derives both keys from it by appending `.webp` or `_thumb.webp`.

The now-unused `astro:assets` configuration — the Netlify remote-image allowlist,
`image.remotePatterns`, and the adapter's dev image feature — is removed.

## Consequences

### Positive

- Building and running the site no longer downloads or transforms photography
  originals.
- The page loads derivatives straight from the CDN, in the same way as every other
  image on the site.
- The 144 MB of originals never enters the request path.

### Negative

- Adding a photograph is a manual two-step: generate the derivatives, then upload
  three files.
- The key convention is implicit, so a missing or misnamed derivative is a silent
  404 rather than a build failure.
- `astro:assets` is no longer exercised anywhere, so its configuration can rot
  unnoticed until it is needed again.
- The bucket still sets no `Cache-Control`; a Cloudflare cache rule for
  `cdn.m4t.tf/photography/*` remains the follow-up.
