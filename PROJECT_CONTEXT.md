# THE BASE project context

## What this project is

THE BASE is an international corporate B2B sales website. Its primary conversion path is:

```text
communicate product value
→ qualify a B2B buyer or partner
→ capture a lead with source attribution
```

It includes catalogue/cart presentation, but it is not merely an e-commerce storefront. Distributor, sample, private-label, contact, and partnership enquiries are core business flows.

## Why the migration exists

The current public site is built in Tilda. It is being migrated to Next.js, TypeScript, OpenNext, and Cloudflare Workers to enable maintainable components, Git and code review, preview/staging environments, controlled deployment and rollback, API integrations, a future Odoo connection, and a future Partner Hub.

This is a parity migration, not a redesign. Existing URLs, content, design behavior, metadata, redirects, forms, and attribution remain the source of truth until the migration stabilizes.

## Business-critical constraint

The domain has roughly two years of organic search history. THE BASE also receives genuine B2B referrals where first-touch attribution includes `utm_source=chatgpt.com`. Search and AI discoverability are business requirements, not optional polish.

Do not lose title, description, H1, canonical, structured data, internal links, redirect behavior, or UTM fields. Never treat a visually successful page as complete if its HTML, forms, or crawler behavior regressed.

## Current architecture

```text
Figma / existing production design
                ↓
Next.js App Router + TypeScript
                ↓
OpenNext for Cloudflare
                ↓
Cloudflare Workers
```

- Production: `https://thebasebev.com` — still Tilda.
- Cloudflare account: `mansua`, dedicated to THE BASE.
- Staging: `https://the-base-staging.mansua.workers.dev`.
- Production preview: `https://the-base-production.mansua.workers.dev`, with no custom domain.
- Personal Cloudflare account `indukok667` is not THE BASE infrastructure and must never receive future THE BASE deployments. Its legacy previews are retained temporarily only as rollback/reference.
- Local Tilda export: technical content/design/asset source of truth.
- Live Tilda site: read-only reference for current production parity.

## Intended future architecture

```text
GoDaddy (registrar only)
            ↓
Cloudflare (DNS / CDN / WAF / Workers)
            ↓
Next.js application
            ↓
CMS / Lead API / future Odoo integrations
```

The registrar, nameservers, custom domain, and live traffic must not be changed without a separately approved cutover. Teammates must be invited manually only to Cloudflare account `mansua`, never to personal account `indukok667`.

## International architecture — future only

The expected future URL/currency model is:

```text
/global/en/ → USD
/ae/en/
/ae/ar/     → AED
/sa/en/
/sa/ar/     → SAR
/kz/en/
/kz/ru/     → KZT
/uk/en/     → GBP
```

DO NOT implement this before the current migration stabilizes. Current production URLs must remain unchanged during the parity phase. New layout/data components should avoid assumptions that make future locale/RTL work impossible.

## Partner Hub

Partner Hub is a separate authenticated B2B application area, not a section to merge into the public clone automatically:

```text
thebasebev.com
→ public marketing / sales site

partners.thebasebev.com
→ authenticated Partner Hub
→ Odoo
```

See `AGENTS.md`, `CLOUDFLARE_MIGRATION.md`, `PRODUCTION_CUTOVER.md`, and `ROLLBACK_PLAN.md` before infrastructure work.
