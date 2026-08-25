# Prelaunch QA record

Generated: 2026-08-26

## Build under test

- Branch: `integration/prelaunch`
- Merge baseline: `182b233`
- Cloudflare staging deployment: `the-base-staging`
- Deployed version: `c47d3688-fe4f-4088-adb7-2b9bc2314fcf`
- URL: `https://the-base-staging.mansua.workers.dev`
- Custom domain: none

## Local production-build QA

| Check | Result |
| --- | --- |
| TypeScript | PASS |
| ESLint | PASS |
| Next production build | PASS; 111 static pages and four dynamic APIs |
| OpenNext build | PASS; 110 document fast-path assets |
| Referenced assets | PASS; 563/563 |
| Lead contract | PASS; 42 checks |
| Stripe Test POC | PASS; 15 tests |
| HTTP smoke | PASS; 39 public routes and five redirects |
| Browser smoke | PASS |
| Responsive homepage | PASS at 1440, 1280, 1024, 768, 430, 390, 375, 360 and 320 px |
| Commerce audit | PASS; no order submitted |
| Route/indexability | PASS; 113 routes, five redirects, 29 sitemap URLs |
| SEO parity | PASS; 29 canonical routes, zero critical failures |
| Analytics isolation | PASS |
| npm audit | PASS; zero vulnerabilities |
| Production-readiness orchestrator | PASS against Cloudflare staging |

Browser coverage includes the marquee hero, loading gate, header, fullscreen menu,
region control, search/navigation links, bestseller carousel, reading rail,
catalog filters/prices, add-to-cart, cart dialog, product sample popup, safe lead
error UX, and cross-route first-touch attribution. The lead response is mocked in
browser smoke, so that test can never create a CRM record.

## Controlled integration checks

Exactly one deliberately labelled CRM lead was submitted through the current
Next.js `/api/leads` code using the local production build because Cloudflare
staging was unavailable after deployment. Read-only Odoo verification found
exactly one matching record and confirmed name/email/phone mapping, Tilda
source, marker, request ID, form name, landing/submission pages, referrer,
`utm_source=chatgpt.com`, medium, campaign and both timestamps. No raw PII was
written to reports.

Stripe SDK authentication passed with a Test Mode key and a read-only API
response reported `livemode=false`. No Live key or Stripe Live resource was
used. One AED 45.38 Test Checkout completed as paid. The real
`checkout.session.completed` event and one duplicate resend both reached the
staging webhook with HTTP 200 and valid signatures. The Checkout POC remains
detached from the site cart and from Odoo.

## Remote staging status

The staging Worker in account `mansua` is healthy. The full remote suite passed:
39 public routes and five redirects, browser interaction and nine responsive
viewports, 29 canonical SEO routes, commerce without order submission, and nine
search/AI crawler user agents. The Worker returns transport-level
`noindex, nofollow` on `workers.dev`, while canonicals remain on
`https://thebasebev.com`.

Do not work around this by deploying to personal account `indukok667`.

## Remaining manual gates

- Stripe Test E2E is complete; production payment architecture remains a separate owner decision.
- Confirm Telegram notification ownership and provide staging bot/chat credentials if parity is required.
- Confirm the authoritative GTM/GA property and consent behavior before cutover.
- Production domain, DNS, Tilda and Search Console changes require separate human approval.
