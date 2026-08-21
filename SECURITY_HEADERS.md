# Security headers audit

## Implemented preview baseline

`worker.ts` adds the following to application responses:

| Header | Value | Status |
| --- | --- | --- |
| `X-Content-Type-Options` | `nosniff` | enabled |
| `Referrer-Policy` | `strict-origin-when-cross-origin` | enabled |
| `Permissions-Policy` | `camera=(), microphone=(), geolocation=()` | enabled |
| `X-Frame-Options` | `SAMEORIGIN` | enabled |
| `X-Robots-Tag` | `noindex, nofollow` on every preview hostname | enabled |
| `Cache-Control` | `no-store` for `/api/*` | enabled |

Cloudflare provides HTTPS for Worker previews. `X-Powered-By` is disabled in `next.config.ts`.

## Deliberately deferred

- HSTS is not enabled aggressively before the real domain and all subdomains are reviewed. `includeSubDomains` or preload can break unreconciled services and is difficult to undo quickly.
- Content-Security-Policy is not enforced yet. The compatibility layer still uses exported scripts/assets and external business integrations; a guessed policy could break analytics, images, videos, forms, or payment/order behavior.
- A stricter frame policy requires confirmation that no approved partner embedding flow exists.

## Future review

All real-domain/dashboard changes are `HUMAN APPROVAL REQUIRED`:

1. Collect CSP violation reports in report-only mode.
2. Inventory every required script, style, image, font, media, connect, frame, and form endpoint.
3. Remove remaining avoidable legacy dependencies before enforcement.
4. Test analytics, catalogue/cart, every lead form, media, and any payment/order flow.
5. Review HSTS only after HTTPS and rollback behavior are proven for every required subdomain.
6. Re-run remote browser smoke with the exact production-preview build.

Security hardening must not silently disable revenue or attribution flows.
