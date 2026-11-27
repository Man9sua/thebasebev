# THE BASE website

[thebasebev.com](https://thebasebev.com/) runs on Next.js and Cloudflare Workers. The homepage, catalogue and checkout use React components. The compatibility layer serves the remaining Tilda pages from the local export and preserves their URLs and metadata.

## Stack

- Next.js 16, App Router
- React 19
- TypeScript
- Global/exported CSS during the compatibility phase
- OpenNext for Cloudflare
- Separate staging and production Workers
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

Stripe checkout uses Test Mode on staging and separately configured Live Mode only on owner-approved origins. Approved Excel prices, 5% VAT and UAE delivery rules are configured; unresolved variants remain on quotation. Paid events are verified against durable order snapshots before creating an Odoo Sales draft quotation. Stripe checks are included in CI and the readiness audit. See `context/PAYMENT_PIPELINE.md` for setup and verification status.

### Shop and checkout

The shop uses the established `/ae/catalog` URL (and country aliases). UAE visitors
choose products, free samples and quantities; other markets can choose free samples.
The persistent baskets remain separate in storage but combine into one UAE shipment
and checkout. The supplied Shop
and Checkout HTML determine the layout; the published product/flavour registry
determines what can be selected.

Approved variant prices are in `src/data/shop-prices.json`, in AED minor units
(fils), with source SKU, pack size and spreadsheet row. `src/lib/shop-payment.ts`
calculates 5% additional VAT and one UAE delivery charge: AED 30 before VAT below
AED 500 in paid goods, free from AED 500 before VAT. Samples do not increase that
threshold. Sample-only parcels cost AED 30 before VAT up to 5 kg; unknown weights
and heavier parcels require a quote. See `context/SHOP_PRICING.md` for unmatched variants.
HTML demo prices and legacy prices are never substituted. `/api/leads` remains
the request path for unresolved variants and delivery quotes.

`STRIPE_SECRET_KEY` and `STRIPE_WEBHOOK_SECRET` are server-side staging secrets.
They are accepted only on staging/localhost. Live uses separate `STRIPE_LIVE_*`
keys, an exact approved origin and a separate Odoo action and D1 ledger. Checkout creates
zero-priced sample lines and a separate delivery line taxed at 5%. The return page verifies
the Stripe session and quoted totals before confirming payment, and clears only
the matching unchanged basket. A failed/cancelled payment keeps the basket.
The webhook verifies signatures and records fulfillment only after an Odoo draft
quotation commits. Durable snapshots live in mode-specific D1 databases; a transaction
lock in Odoo prevents duplicate quotations after concurrent deliveries or timeouts.

The destination is a paid **draft quotation in Odoo Sales**, without automatic
confirmation or invoicing. See [PAYMENT_PIPELINE.md](context/PAYMENT_PIPELINE.md) for the
Test Mode evidence and Live setup/verification requirements. Live is approved on
`https://the-base-production.mansua.workers.dev` and, since 2026-11-05, the already
routed `https://thebasebev.com` domain and its `www` alias. Exact server-configured
origins share the existing Live webhook and ledger. No automatic confirmation or
invoicing is enabled; this task does not change domain routes, DNS or Tilda.

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

The `the-base-production` Worker serves both `https://thebasebev.com` and its Workers preview. A deployment to that Worker updates the live site. Merges to `main` run CI and then deploy to production. See [the deployment workflow](./context/AUTO_DEPLOY.md).

Current verified staging deployment:

```text
https://the-base-staging.mansua.workers.dev
```

Current verified production preview:

```text
https://the-base-production.mansua.workers.dev
```

The Cloudflare build prepares a generated Static Assets document fast path so public SSG pages stay below the target account's Workers Free CPU limit. The duplicate incremental cache is disabled; dynamic APIs remain in OpenNext. Next 16.4 requires OpenNext 1.20.14 or later to inline `server/preview-props.json`; a successful Next build alone does not verify those API handlers. The scoped `@node-minify/core` glob override keeps that adapter's build dependency on a patched release. `worker.ts` adds safe baseline headers and forces `X-Robots-Tag: noindex, nofollow` on staging and every `workers.dev` preview. Only a future approved request on the exact real production hostname can omit that transport directive. No custom domain route is configured.

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
ODOO_API_KEY=
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

Project context, runbooks and component specifications live in [context](./context/). Audit commands write their Markdown reports to `.audit-artifacts/`.

- [Route mapping](context/ROUTE_MAP.md)
- [SEO parity inventory](context/SEO_PARITY.md)
- [Migration status, blockers, and extraction plan](context/MIGRATION_NOTES.md)
- [Human project context](context/PROJECT_CONTEXT.md)
- [Cloudflare migration plan](context/CLOUDFLARE_MIGRATION.md)
- [DNS snapshot and future migration](context/DNS_MIGRATION.md)
- [Crawler policy](context/CRAWLER_POLICY.md)
- [Caching policy](context/CLOUDFLARE_CACHE.md)
- [Security headers audit](context/SECURITY_HEADERS.md)
- [Missing credentials](context/NEEDS_CREDENTIALS.md)
- [Rollback plan](context/ROLLBACK_PLAN.md)
- [Future production cutover](context/PRODUCTION_CUTOVER.md)
- [Contributor workflow](./CONTRIBUTING.md)
