# ADR 015: Cloudflare DNS with Netlify-Managed Certificates

## Context

The domain is registered at OVH, authoritative DNS is on Cloudflare, and the
site is hosted on Netlify. The apex `A` record points at `75.2.60.5`, Netlify's
apex load balancer, through the Cloudflare proxy; `www` and the eight emoji
subdomain aliases are `CNAME`s to `ma-tf.netlify.app`.

Cloudflare terminates browser TLS with its own edge certificate, covering
`m4t.tf` and `*.m4t.tf`. Netlify terminates the Cloudflare-to-origin leg with a
Let's Encrypt certificate it manages.

Above five subdomain aliases Netlify issues a wildcard certificate rather than
one covering each name. A wildcard needs a DNS-01 challenge, which Netlify can
only answer from Netlify DNS, where it writes the `_acme-challenge.m4t.tf` TXT
record.

With the zone on Cloudflare that record was never authoritative. The
certificate was issued on 2026-07-15 while the domain still used Netlify's
nameservers, and renewal only began failing about thirty days before expiry,
because Let's Encrypt certificates last ninety days.

## Decision

Authoritative DNS stays on Cloudflare and certificate management stays with
Netlify, reconciled by delegating only the ACME challenge name back to Netlify:

    _acme-challenge.m4t.tf  NS  dns1.p02.nsone.net
    _acme-challenge.m4t.tf  NS  dns2.p02.nsone.net
    _acme-challenge.m4t.tf  NS  dns3.p02.nsone.net
    _acme-challenge.m4t.tf  NS  dns4.p02.nsone.net

These are DNS-only records in the Cloudflare zone. Netlify still writes its
challenge TXT into its own zone; the delegation is what makes that zone
authoritative for the challenge name, so the wildcard renews without
intervention.

Cloudflare's SSL/TLS mode is Full (strict) and Always Use HTTPS is on. No
certificate is installed or rotated by hand, and no custom certificate is used.

## Consequences

### Positive

- The wildcard renews automatically for the apex and every subdomain, including
  the emoji aliases and any added later.
- No private key is stored outside Netlify and nothing is rotated by hand.

### Negative

- The delegation is undocumented by Netlify and load-bearing. Deleting Netlify's
  DNS zone would leave `_acme-challenge.m4t.tf` pointing at dead nameservers, so
  the delegation must go at the same time.
- Netlify keeps an otherwise unused DNS zone for `m4t.tf` purely to hold the
  challenge record. It looks like cleanup and is not.
- A stale OVH zone still answers authoritatively on `ns10.ovh.ca` and
  `dns10.ovh.ca`. It is not delegated, but it has no MX records and a
  `v=spf1 -all` record, so it must be deleted rather than depended on.

## Alternatives considered

- **Move DNS to Netlify.** Gives the wildcard for free but gives up the
  Cloudflare proxy, edge caching and the `cdn.m4t.tf` R2 custom domain.
- **Cloudflare Origin CA certificate installed on Netlify.** Removes the
  challenge, but Netlify does not auto-renew custom certificates.
- **Drop the subdomain aliases** so Netlify uses an HTTP-01 certificate. Works,
  but moves the redirects to the Cloudflare edge and leaves a missed rule one
  `525` away.
