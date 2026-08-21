# Search and AI crawler policy

## Business policy

THE BASE chooses maximum search discoverability and maximum AI discoverability for public marketing content.

Planned Cloudflare policy at the real cutover:

```text
Search   → ALLOW
Agent    → ALLOW
Training → ALLOW
```

This is a future zone/WAF configuration checklist. No production Cloudflare zone setting was changed while preparing it.

## Crawlers that must remain testable

- Googlebot
- Bingbot
- Applebot
- OAI-SearchBot
- ChatGPT-User
- PerplexityBot
- Perplexity-User
- Claude-SearchBot
- Claude-User

Do not add application `robots.txt`, response headers, middleware, firewall assumptions, or rate limits intended to block these agents. Legitimate abuse protection can be designed separately, but it must be tested against crawler accessibility and must not rely only on a spoofable User-Agent.

## Environment behavior

- Staging: crawler requests receive normal content and HTTP 200, plus transport `X-Robots-Tag: noindex, nofollow`.
- Production preview on `workers.dev`: the same noindex transport guard prevents a duplicate index.
- Approved `thebasebev.com` production: public pages are indexable; robots allows crawling and advertises the canonical sitemap.
- Canonicals always point to the real production hostname, never a preview hostname.

Preview noindex is not a crawler block: it lets audits read the same content while asking indexes not to retain the preview URL.

## Cutover checklist

All zone changes are `HUMAN APPROVAL REQUIRED`:

- [ ] Confirm Cloudflare Search category is ALLOW.
- [ ] Confirm AI Agent category is ALLOW.
- [ ] Confirm AI Training category is ALLOW.
- [ ] Review WAF/bot rules for accidental challenge/block actions.
- [ ] Fetch `/`, `/catalog`, a product page, `/robots.txt`, and `/sitemap.xml` with every listed User-Agent.
- [ ] Confirm no 403, 429, 5xx, interstitial challenge, or missing HTML.
- [ ] Confirm real production has no `X-Robots-Tag: noindex`.
- [ ] Confirm preview hostnames still do have `noindex, nofollow`.

Run `npm run audit:crawlers -- <target-url>` for the diagnostic matrix. The script does not bypass or evade Cloudflare controls.
