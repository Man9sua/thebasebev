# Cloudflare caching policy

## Current application strategy

OpenNext uses `staticAssetsIncrementalCache` with cache interception enabled in `open-next.config.ts`. The generated Worker serves `.open-next/assets` through the `ASSETS` binding. This retains OpenNext's adapter-level static/SSG behavior instead of adding an unrelated custom cache implementation.

The site currently has static public pages and two dynamic API boundaries:

- `POST /api/leads` — credentialed lead forwarding; never public-cache.
- `GET /api/health` — dynamic diagnostic response; never cache.

The custom wrapper applies `Cache-Control: no-store` to `/api/*`. No POST response, lead payload, form error, order state, or user-specific data may be placed in a public cache.

## Policy by resource type

| Resource | Policy | Reason |
| --- | --- | --- |
| Hashed Next/OpenNext static assets | long-lived/immutable adapter defaults | content-addressed assets are safe to retain |
| Exported images, fonts, CSS, JS, video | Cloudflare/static asset behavior; review TTL after parity | public versioned assets |
| Static/SSG HTML | OpenNext/Next semantics | preserve framework revalidation and invalidation behavior |
| ISR data, if introduced | OpenNext incremental cache only | avoid conflicting cache authorities |
| `/api/leads` | `no-store`, never Cache Everything | contains personal and attribution data |
| `/api/health` | `no-store` | deployment freshness signal |
| Form POST/order/checkout endpoints | `no-store`, no public cache | stateful/personal/business data |
| Authenticated future Partner Hub | private/no-store unless explicitly designed | separate application security boundary |

## Before production cutover

Every dashboard rule change is `HUMAN APPROVAL REQUIRED`:

- [ ] Inspect generated `Cache-Control`, `ETag`, and asset headers on production preview.
- [ ] Confirm no Cloudflare Cache Rule applies `Cache Everything` to `/api/*`, form actions, cart, checkout, or authenticated paths.
- [ ] Confirm HTML updates and rollback can purge predictably.
- [ ] Test a cold request and a warm request for representative static assets and pages.
- [ ] If ISR is added, test freshness/invalidation before enabling it for business content.
- [ ] Document cache purge ownership and rollback command/process.

Do not replace the OpenNext strategy merely to maximize cache-hit ratio. Correctness, parity, and non-caching of personal data take priority.
