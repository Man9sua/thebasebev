# Future production cutover runbook

This is a plan, not authorization. The current `thebasebev.com` must continue serving Tilda until a human owner schedules and approves every production action.

## Gate 0 — ownership and freeze

- [ ] `HUMAN APPROVAL REQUIRED` Name the cutover owner and rollback authority.
- [ ] `HUMAN APPROVAL REQUIRED` Freeze Tilda content changes or define a final delta-export window.
- [ ] Capture current traffic, Search Console, analytics, conversions, 404s, and top landing-page baseline.
- [ ] Confirm Tilda remains paid/active through the rollback window.

## Gate 1 — DNS and email safety

- [ ] Export the complete GoDaddy DNS zone and screenshots.
- [ ] Compare A, AAAA, CNAME, MX, TXT, CAA, and SRV records line by line.
- [ ] Verify MX priority, the single SPF record, all DKIM selectors, DMARC, Google/Microsoft/other verification, and mail/service subdomains.
- [ ] Send and receive email immediately before cutover.
- [ ] Record current Tilda rollback origin/records.
- [ ] `HUMAN APPROVAL REQUIRED` Reduce relevant website TTL only if the DNS owner agrees and timing permits.

## Gate 2 — application release candidate

- [ ] Deploy the exact release commit to `the-base-production` on `workers.dev`.
- [ ] Record Git commit SHA and Cloudflare Worker version ID.
- [ ] Confirm no custom domain is attached yet.
- [ ] Run `npm run audit:production-readiness -- <production-preview-url>`.
- [ ] Verify all 29 sitemap URLs, all compatibility aliases, and all intentional 301s.
- [ ] Verify preview `X-Robots-Tag: noindex, nofollow` and production-oriented canonical.
- [ ] Verify desktop/mobile browser smoke and commerce UI.
- [ ] Verify lead delivery with owned credentials and an identifiable non-customer test lead.
- [ ] Verify authoritative analytics once, with no duplicate `page_view`.

## Gate 3 — Cloudflare zone policy

- [ ] Review caching; no `Cache Everything` on APIs/forms/checkout/auth.
- [ ] Review WAF and bot settings; avoid crawler challenges.
- [ ] Set Search, Agent, and Training policy to ALLOW.
- [ ] Review SSL/TLS mode and origin assumptions.
- [ ] Keep HSTS/CSP deferred unless their separate review and browser tests pass.
- [ ] `HUMAN APPROVAL REQUIRED` Approve final DNS import and zone configuration.

## Gate 4 — traffic switch

Every item is `HUMAN APPROVAL REQUIRED`:

1. Import and verify the complete DNS zone in Cloudflare.
2. Change GoDaddy nameservers only after two-person comparison.
3. Wait for authoritative Cloudflare answers while continuously checking mail records.
4. Attach the reviewed Worker to `thebasebev.com` and the approved `www` behavior.
5. Confirm the application guard no longer sends `X-Robots-Tag: noindex` on the real hostname.

Do not delete old GoDaddy records, Tilda, or rollback evidence.

## Gate 5 — immediate verification

- [ ] Apex and `www` HTTPS/status/redirect behavior.
- [ ] `/api/health` safe response.
- [ ] Homepage, catalog, products, resources, forms, 404, and redirects.
- [ ] `robots.txt` and 29-entry sitemap.
- [ ] Production canonical and OG URL on representative pages.
- [ ] No production meta/header `noindex`.
- [ ] Googlebot/Bingbot/AI crawler audit without 403/429/challenge.
- [ ] Lead delivery including `utm_source=chatgpt.com`, landing page, and referrer.
- [ ] Analytics single page view and conversion event path.
- [ ] Email send/receive plus MX/SPF/DKIM/DMARC lookup.

## Gate 6 — observation

- Monitor HTTP 5xx, 404s, Worker errors, latency, cache behavior, form delivery, analytics, and crawler responses continuously during the first hours.
- Compare Search Console coverage and organic landing pages over subsequent days; do not use removals.
- Keep Tilda and the rollback path available until the owner closes the observation window.
- Trigger `ROLLBACK_PLAN.md` if an agreed threshold is exceeded.

## Completion evidence

Record: approval names/timestamps, DNS exports, Git SHA, Worker version, commands and results, screenshots, test-lead ID, analytics evidence, crawler report, and final rollback decision.
