# Cloudflare migration plan

This document prepares a future cutover. It does not authorize a domain, DNS, registrar, Tilda, or Search Console change.

## Current state

- Registrar and authoritative DNS: GoDaddy.
- Public production runtime: Tilda at `https://thebasebev.com`.
- Existing Search Console property: retained and untouched.
- New staging runtime: Cloudflare Worker `the-base-staging`.
- New production-preview runtime: Cloudflare Worker `the-base-production` on `workers.dev` only.
- Next.js runtime adapter: OpenNext for Cloudflare.
- No `routes` or `custom_domain` entry exists in `wrangler.jsonc`.

## Target state after an approved cutover

```text
GoDaddy
→ registrar only

Cloudflare
→ authoritative DNS
→ CDN / caching
→ WAF / bot policy
→ redirects
→ Workers

Next.js
→ public application
```

Tilda must remain recoverable through the cutover observation period.

## Isolated Worker environments

| Environment | Worker | Verified version (2026-08-21) | Access before cutover | APP_ENV | Indexability |
| --- | --- | --- | --- | --- | --- |
| staging | `the-base-staging` | `db1bb834-fcba-4f6d-87dc-0dddac490605` | `*.workers.dev` | `staging` | transport `noindex, nofollow` |
| production preview | `the-base-production` | `9b79fc11-4af3-4e15-9625-9f030fc81803` | `*.workers.dev` | `production` | transport `noindex, nofollow` while hostname is `workers.dev` |
| approved production | same reviewed production build | record at cutover | `thebasebev.com` / `www.thebasebev.com` | `production` | indexable |

`worker.ts` is a host-and-environment guard. It adds `X-Robots-Tag: noindex, nofollow` unless both conditions are true:

1. `APP_ENV` is `production`.
2. The exact hostname is `thebasebev.com` or `www.thebasebev.com`.

Canonicals and OG URLs stay oriented to `https://thebasebev.com` on all environments. API responses receive `Cache-Control: no-store`.

## Build and deployment commands

```bash
npm run cf:build
npm run deploy:staging
npm run deploy:production-preview
```

The last two commands deploy only the named Worker environment. Neither command adds a route or custom domain. Before each deployment, inspect `wrangler.jsonc`, run a dry run, and confirm that output lists only the intended Worker name and `workers.dev` URL.

## Production environment preparation checklist

- [x] Separate staging and production-preview Worker names.
- [x] Preview host noindex guard.
- [x] Production-oriented canonical metadata.
- [x] Safe health endpoint at `/api/health`.
- [x] Static asset and incremental-cache OpenNext configuration.
- [x] APIs excluded from public caching.
- [x] Baseline security headers in the Worker wrapper.
- [x] Human-controlled CI with no deploy job.
- [ ] Confirm lead delivery credentials and recipients.
- [ ] Confirm authoritative analytics container/property and consent behavior.
- [ ] Capture complete registrar DNS export, including hidden/selector-specific records.
- [ ] Review future Cloudflare zone security, bot, and caching rules.
- [ ] Run a final production-preview readiness audit immediately before cutover.

## Custom-domain boundary

Adding any of the following is forbidden during preparation:

- a Wrangler `route` for `thebasebev.com`;
- a Worker custom domain for `thebasebev.com` or `www`;
- Cloudflare nameservers at GoDaddy;
- an apex/`www` DNS change.

Every such action is `HUMAN APPROVAL REQUIRED` and belongs only in `PRODUCTION_CUTOVER.md`.

## Verification after every preview deployment

```bash
npm run smoke:http -- <preview-url>
npm run audit:crawlers -- <preview-url>
npm run audit:routes -- <preview-url>
npm run audit:seo-parity -- <preview-url>
npm run audit:analytics -- <preview-url>
npm run smoke:browser -- <preview-url>
npm run audit:commerce -- <preview-url>
```

Also verify `/api/health` returns only `{"status":"ok"}`, canonical never contains `workers.dev`, and every preview response has `X-Robots-Tag: noindex, nofollow`.
