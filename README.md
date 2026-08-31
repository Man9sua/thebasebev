# THE BASE website migration

This repository is the first-stage migration of [thebasebev.com](https://thebasebev.com/) from a local Tilda export to Next.js. The current implementation deliberately prioritizes URL, content, metadata, and visual compatibility before component extraction.

## Current stage

The redesigned homepage is implemented as React components. The remaining site
uses a server-rendered compatibility layer: a catch-all App Router page maps
known production and legacy URLs to the corresponding exported HTML, extracts
page metadata, and emits the exported body on the server. This keeps meaningful
content available in the initial HTML while Tilda blocks are replaced section by
section.

This is not yet a Tilda-free implementation. The compatibility document executes the retained export scripts in the initial server response, and the critical homepage/header/catalog/cart/product-order/form paths are covered by browser smoke tests. Those tests are evidence for the audited paths, not a claim that every legacy popup, calculator, or product interaction has already been ported. A typed lead bridge/API boundary replaces opaque Tilda submission for allowlisted lead forms. Commerce now has a staging-only Stripe Test + D1 fulfillment boundary; Odoo writes remain disabled until the exact product mapping and dedicated credential are approved.

## Stack

- Next.js 16, App Router
- React 19
- TypeScript
- Global/exported CSS during the compatibility phase
- OpenNext for Cloudflare
- Cloudflare Workers staging and isolated production-preview environments
- Dedicated Cloudflare account `mansua`; personal account `indukok667` is excluded

## Requirements

- Node.js 22 or a current version supported by Next.js and OpenNext
- npm
- A Cloudflare account only when previewing or deploying the Worker

No production domain, DNS, Tilda, Search Console, or GoDaddy change is required for local development.

## Install and run locally

```powershell
npm.cmd install
npm.cmd run dev
```

Open `http://localhost:3000`.

Run checks sequentially on Windows/OneDrive to avoid concurrent `.next` file locks:

```powershell
npm.cmd run typecheck
npm.cmd run lint
npm.cmd run audit:leads
npm.cmd run test:stripe
npm.cmd run build
npm.cmd run check:assets
```

Against a running production build, the local smoke commands are:

```powershell
npm.cmd run start -- --hostname 127.0.0.1 --port 3000
npm.cmd run smoke:http -- http://127.0.0.1:3000
npm.cmd run smoke:browser -- http://127.0.0.1:3000
npm.cmd run audit:commerce -- http://127.0.0.1:3000
npm.cmd run audit:routes -- http://127.0.0.1:3000
npm.cmd run audit:analytics -- http://127.0.0.1:3000
```

`smoke:browser` uses installed Chrome, exercises the hero/header/menu, catalogue filters and prices, add-to-cart and checkout dialog, product-order popup, lead error UX, and UTM attribution. It also captures the homepage at 1440, 1280, 1024, 768, 430, 390, 375, 360, and 320 pixels in `.visual-artifacts/`.

`audit:commerce` prints the visible catalogue price map, product metadata, cart state, and checkout-dialog evidence. It adds one item only in an isolated browser context and never submits an order.

`npm run test:stripe` covers checkout validation, persistent fulfillment
semantics, Odoo JSON-2 customer/order behavior, failure recovery and the
server-verified success page without contacting Stripe or writing to Odoo.

The export in `tilda_export/project12027355` is a build-time input. Keep it available when running a clean build; it is the current source of truth for legacy page bodies and metadata.

## Cloudflare Workers

Build the OpenNext bundle:

```powershell
npm.cmd run cf:build
```

Build and preview it locally through OpenNext:

```powershell
npm.cmd run preview
```

Deploy only the configured staging Worker:

```powershell
npx.cmd wrangler auth create mansua
npx.cmd wrangler auth activate mansua .
npx.cmd wrangler whoami --json
npm.cmd run deploy:staging
```

Deploy the same reviewed build to the isolated production-preview Worker:

```powershell
npm.cmd run deploy:production-preview
```

This command targets `the-base-production` on `workers.dev` only. It does not attach `thebasebev.com`.

The configured staging Worker name is `the-base-staging`. The repository does not configure the production domain and this workflow must not be used to change `thebasebev.com`, its DNS, or the existing Tilda project. Version `daa6c072-728d-4c24-9e96-7856b048b41f` was deployed on 2026-08-24. Post-deploy smoke is temporarily blocked by Cloudflare Error 1027 because account `mansua` exhausted its Free daily Worker request quota; repeat the remote suite after the 00:00 UTC reset.

The staging Worker binds D1 database `the-base-commerce-staging`. Apply checked-in
commerce migrations explicitly to staging with:

```powershell
npx.cmd wrangler d1 migrations apply the-base-commerce-staging --remote --env staging
```

Do not point this binding or command at a production database without a
separately reviewed production migration plan.

Current verified staging deployment:

```text
https://the-base-staging.mansua.workers.dev
```

Current verified production preview:

```text
https://the-base-production.mansua.workers.dev
```

The OpenNext configuration uses its read-only Workers Static Assets incremental cache for the SSG pages. The Cloudflare build also prepares a generated static-document fast path so the public site stays below the target account's Workers Free CPU limit; dynamic APIs remain in OpenNext. `worker.ts` adds safe baseline headers and forces `X-Robots-Tag: noindex, nofollow` on staging and every `workers.dev` preview. Only a future approved request on the exact real production hostname can omit that transport directive. No custom domain route is configured.

Run the complete sequential verification against a deployed target with:

```powershell
npm.cmd run audit:production-readiness -- https://the-base-production.mansua.workers.dev
npm.cmd run audit:cloudflare-parity
```

Individual remote audits are available as `audit:crawlers`, `audit:seo-parity`, `audit:routes`, and `audit:analytics`. They are diagnostic only and do not bypass Cloudflare controls or submit real leads/orders.

`smoke:http` submits only an invalid lead payload, and `smoke:browser` mocks the
lead endpoint. The full readiness orchestrator therefore cannot create a CRM
lead. The opt-in `test:lead-live` command is the only intentional delivery path.

## Environment and integrations

The intended integration boundary uses environment variables such as:

```dotenv
NEXT_PUBLIC_GA_ID=
NEXT_PUBLIC_GTM_ID=
LEAD_API_URL=
LEAD_API_KEY=
ODOO_URL=
ODOO_DATABASE=
ODOO_API_KEY=
ODOO_COMMERCE_ENABLED=
ODOO_PRODUCT_MAPPING_JSON=
```

Do not commit real secrets. `.env.example` documents the intended boundary. The local `/api/leads` route validates a typed payload and forwards it to server-only `LEAD_API_URL`; `LEAD_API_KEY` is optional for the current upstream. Staging stores the endpoint as a Worker secret. Without an endpoint it intentionally returns a service-unavailable response and does not pretend a lead was delivered.

The export contained overlapping GA/GTM runtimes. They are removed from compatibility HTML. The controlled analytics component runs only on the exact production hostname, gives a confirmed GTM container precedence, and uses direct GA only when GTM is absent. Preview traffic therefore does not pollute the historical properties.

## Compatibility-layer architecture

```text
Known public or legacy URL
  -> App Router catch-all route
  -> site-pages route registry and export parser
  -> metadata, exported head assets, and exported body
  -> LegacyDocument server-rendered compatibility component
  -> future React sections and typed integration adapters
```

Important boundaries:

- `src/lib/site-pages.ts` maps friendly routes, legacy aliases, and product compatibility URLs to local export files.
- `src/components/legacy/LegacyDocument.tsx` emits the preserved export markup.
- `src/components/forms/LeadAttributionBridge.tsx` intercepts allowlisted legacy lead forms, preserves first-touch referrer/UTMs in session storage, validates the payload, and submits to the same-origin API boundary.
- `src/lib/leads.ts` owns the typed attribution/order payload and shared validation; `src/app/api/leads/route.ts` is the credentialed forwarding boundary.
- `src/app/robots.ts`, `src/app/sitemap.ts`, and generated metadata provide the current SEO foundation.
- `worker.ts` owns environment/hostname noindex, API cache, and baseline security headers around the generated OpenNext Worker.
- `src/components/analytics/Analytics.tsx` is the single analytics bootstrap boundary.
- `src/app/api/health/route.ts` returns a minimal uncached deployment health signal.
- Header source `page62362389.html` and footer source `page62447481.html` are retained as compatibility pages and extraction references.

## Visual reference baseline

The captured raw Tilda export and live production homepage matched byte-for-byte at the audited reference sizes:

| Viewport | Matching SHA-256 |
| --- | --- |
| 1440x1000 | `12ca4d2c412b49067fe0b6476e408322172c475b4a69b06f5ec713bf771bfc3f` |
| 768x1000 | `8846883f529423380cdc6fe6fc2dbda899949c76e33555fb8f75572d636a52ca` |
| 390x844 | `c45afe2f4a05bb3a8ed2999e04484781fe23f1f77eccfb11cab9cdf446ce0a3c` |

These hashes validate the export as a visual reference. The Next.js build now has nine responsive captures, and the export/Next computed layout was compared under the same browser/network conditions. The compatibility output preserves the source's responsive geometry and transient intro animations; screenshots taken at different animation times are not expected to be byte-identical.

## Documentation

- [Route mapping](./ROUTE_MAP.md)
- [SEO parity inventory](./SEO_PARITY.md)
- [Migration status, blockers, and extraction plan](./MIGRATION_NOTES.md)
- [Human project context](./PROJECT_CONTEXT.md)
- [Cloudflare migration plan](./CLOUDFLARE_MIGRATION.md)
- [DNS snapshot and future migration](./DNS_MIGRATION.md)
- [Crawler policy](./CRAWLER_POLICY.md)
- [Caching policy](./CLOUDFLARE_CACHE.md)
- [Security headers audit](./SECURITY_HEADERS.md)
- [Missing credentials](./NEEDS_CREDENTIALS.md)
- [Rollback plan](./ROLLBACK_PLAN.md)
- [Future production cutover](./PRODUCTION_CUTOVER.md)
- [Contributor workflow](./CONTRIBUTING.md)
- [Generated route/indexability report](./ROUTE_INDEXABILITY_AUDIT.md)
- [Generated SEO comparison report](./SEO_PARITY_REPORT.md)
- [Generated analytics audit](./ANALYTICS_AUDIT.md)
- [Prelaunch merge matrix](./PRELAUNCH_MERGE_MATRIX.md)
- [Prelaunch QA record](./MANUAL_QA.md)
- [Stripe Test Mode POC](./STRIPE_TEST_POC.md)
- [Commerce production readiness](./COMMERCE_PRODUCTION_READINESS.md)

## Delivery status

| Area | Status | Current evidence / next gate |
| --- | --- | --- |
| Export inventory and route registry | DONE | Local export and public/legacy mappings were inventoried. |
| Next.js and Cloudflare foundation | DONE | App Router and OpenNext configuration exist. |
| Server-rendered legacy content | DONE | Known routes render export content through the catch-all compatibility layer. |
| SEO parity | DONE | Production build and HTTP smoke verify 39 routes, five exact 301 redirects, canonical sitemap/robots, branded 404, and server HTML. |
| Visual parity of Next.js output | PARTIAL | Nine target widths are captured and representative layouts were reviewed; exhaustive page-by-page pixel diffs remain. |
| Interactive parity | PARTIAL | Hero, header/menu/region, mobile menu, catalogue filters/prices, add-to-cart, checkout dialog, product-order popup, and honest form failure UX pass browser smoke; remaining legacy surfaces still need route-level tests/React extraction. |
| Lead delivery and attribution | STAGING VERIFIED | Typed bridge/API exist; one controlled Odoo lead preserved request ID and full first-touch attribution. Production enablement remains human-controlled. |
| Checkout/order delivery | NEEDS CREDENTIALS | Cart state/UI are verified without submitting a real order; owned receiver/payment contracts are required. |
| Dynamic recipes/catalog feed | BLOCKED | Upstream feed data is not contained in the export. |
| OpenNext Worker bundle | DONE | `npm run cf:build` completes locally; Windows emits the upstream WSL recommendation. |
| Cloudflare staging deployment | PARTIAL | Version `daa6c072-728d-4c24-9e96-7856b048b41f` is deployed in `mansua`; post-deploy remote smoke is blocked by account-wide Error 1027 until the Free quota resets. |
| Cloudflare production preview | DONE | Separate `the-base-production.mansua.workers.dev` Worker exists in `mansua` with preview noindex and no custom domain. |
| GitHub CI/CD | DONE | Pull requests and shared-branch pushes run verification only. A separate manual workflow can deploy `workers.dev` previews only after enforcing the `mansua` account ID; GitHub environment credentials still need owner configuration. |
| Production cutover | HUMAN APPROVAL REQUIRED | Runbooks are prepared; domain, DNS, Tilda, and Search Console remain untouched. |
