# Cloudflare caching policy

## Current application strategy

OpenNext uses `staticAssetsIncrementalCache` with cache interception enabled in `open-next.config.ts`. The generated Worker serves `.open-next/assets` through the `ASSETS` binding. This retains OpenNext's adapter-level static/SSG behavior instead of adding an unrelated custom cache implementation.

The site currently has static public pages and four dynamic API boundaries:

- `POST /api/leads` — credentialed lead forwarding; never public-cache.
- `GET /api/health` — dynamic diagnostic response; never cache.
- `POST /api/checkout/stripe` — isolated Test Mode session creation; never cache.
- `POST /api/stripe/webhook` — raw signed Test Mode event boundary; never cache.

The custom wrapper applies `Cache-Control: no-store` to `/api/*`. No POST response, lead payload, form error, order state, or user-specific data may be placed in a public cache.

The isolated account `mansua` uses per-Worker Static Assets uploads only. THE BASE has no R2, KV, D1, Cache API binding, or cross-account storage dependency. The local asset audit covers 563 referenced public files; OpenNext additionally packages framework chunks and generated SSG cache objects into each deployment manifest.

Because `mansua` currently has the Workers Free 10 ms CPU limit, `npm run cf:build` also prepares 110 prerendered document assets under the generated `.open-next/assets/__static_pages/` namespace. `worker.ts` serves document GET/HEAD requests and public files through `ASSETS`, applies the same deployment/noindex/security headers, and uses OpenNext only for dynamic APIs or RSC. This is build output and remains excluded from Git. Worker error-tail and full parity/browser audits are required after changing this path.

## Policy by resource type

| Resource | Policy | Reason |
| --- | --- | --- |
| Hashed Next/OpenNext static assets | long-lived/immutable adapter defaults | content-addressed assets are safe to retain |
| Exported images, fonts, CSS, JS, video | Cloudflare/static asset behavior; review TTL after parity | public versioned assets |
| Static/SSG HTML | OpenNext/Next semantics | preserve framework revalidation and invalidation behavior |
| ISR data, if introduced | OpenNext incremental cache only | avoid conflicting cache authorities |
| `/api/leads` | `no-store`, never Cache Everything | contains personal and attribution data |
| `/api/health` | `no-store` | deployment freshness signal |
| `/api/checkout/stripe` | `no-store`, never Cache Everything | external API call and test session state |
| `/api/stripe/webhook` | `no-store`, never Cache Everything | signed event delivery and idempotency boundary |
| Form POST/order/checkout endpoints | `no-store`, no public cache | stateful/personal/business data |
| Authenticated future Partner Hub | private/no-store unless explicitly designed | separate application security boundary |

## Before production cutover

Every dashboard rule change is `HUMAN APPROVAL REQUIRED`:

- [ ] Inspect generated `Cache-Control`, `ETag`, and asset headers on production preview.
- [ ] Confirm no Cloudflare Cache Rule applies `Cache Everything` to `/api/*`, form actions, cart, checkout, or authenticated paths.
- [ ] Confirm HTML updates and rollback can purge predictably.
- [ ] Test a cold request and a warm request for representative static assets and pages.
- [ ] After a fresh large Workers Static Assets deployment, allow edge propagation to settle and require the 113-route audit to pass; do not interpret transient preview propagation as permission to weaken the route contract.
- [ ] If ISR is added, test freshness/invalidation before enabling it for business content.
- [ ] Document cache purge ownership and rollback command/process.

Do not replace the OpenNext strategy merely to maximize cache-hit ratio. Correctness, parity, and non-caching of personal data take priority.
