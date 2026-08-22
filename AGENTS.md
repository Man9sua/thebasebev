# THE BASE agent context

Project: THE BASE

- Production: `https://thebasebev.com`
- Current production runtime: Tilda
- New runtime: Next.js + TypeScript + Cloudflare Workers/OpenNext
- Staging: `https://the-base-staging.mnsdemo.workers.dev`
- Production preview: a separate `the-base-production` Worker on `workers.dev`; it is not the production domain.

The migration must preserve SEO, organic Google traffic, AI/Search referrals, existing URLs, forms and attribution, and design parity. The local Tilda export is the content/design reference; live production is a read-only comparison target.

## Critical rules

- DO NOT modify production DNS or GoDaddy.
- DO NOT connect `thebasebev.com` without explicit human approval.
- DO NOT remove or modify Tilda.
- DO NOT change production URLs or redesign during parity/migration work.
- DO NOT introduce `noindex` on the real production hostname.
- DO NOT expose secrets or commit real `.env`/`.dev.vars` files.
- Staging and every `workers.dev` preview MUST be `noindex, nofollow` at the transport layer.
- The real production hostname MUST be indexable after an approved cutover.
- Preserve title, description, H1, canonical, structured data, internal links, redirects, image metadata, and UTM attribution.
- Preserve first-touch `utm_source=chatgpt.com`.
- Do not intentionally block Googlebot, Bingbot, Applebot, OAI-SearchBot, ChatGPT-User, PerplexityBot/Perplexity-User, or Claude search/user crawlers.
- Do not activate all exported analytics IDs. `GTM` is authoritative when configured; direct GA is only a fallback.

## Lead pipeline rules

- All public forms MUST submit to `/api/leads`. No other client-facing lead endpoint.
- DO NOT call Odoo directly from client-side code.
- DO NOT expose Odoo webhook URLs, or `LEAD_API_URL`, to the browser. Never use a `NEXT_PUBLIC_` prefix for either.
- DO NOT modify, redeploy, or delete the production `tilda-odoo.thebasebev.workers.dev` Worker. It serves live Tilda traffic.
- Preserve attribution on every lead, including first-touch `utm_source=chatgpt.com`, `landing_page`, `current_page`, and `referrer`.
- Never report a successful submission when the upstream delivery failed.
- Field names sent upstream are Tilda's, not ours. Map them in `src/lib/lead-forms.ts` only — do not rename fields at a call site.

See `LEAD_PIPELINE.md` for the full contract and `TELEGRAM_MIGRATION.md` for the open Telegram question.

The custom Worker wrapper in `worker.ts` only removes preview `X-Robots-Tag` when `APP_ENV=production` and the exact request hostname is `thebasebev.com` or `www.thebasebev.com`. Canonicals always remain on `https://thebasebev.com`.

## Required checks

After substantial changes run, at minimum:

```bash
npm run typecheck
npm run lint
npm run build
npm run cf:build
npm run check:assets
npm run audit:commerce -- <target-url>
npm run smoke:http -- <target-url>
npm run smoke:browser -- <target-url>
npm run audit:routes -- <target-url>
npm run audit:seo-parity -- <target-url>
npm run audit:crawlers -- <target-url>
npm audit
```

`npm run audit:production-readiness -- <target-url>` is the sequential full orchestrator. It performs remote read-only tests and does not submit a lead or order.

Before changing Next.js APIs, read the relevant guide under `node_modules/next/dist/docs/`. Deploy staging or production-preview only when explicitly authorized; never add a custom domain during migration preparation.

## Git workflow

- `main`: stable, production-ready branch.
- `develop`: integration branch.
- Work on `feature/*`, `fix/*`, or `migration/*`; open a PR toward `develop`, then promote reviewed releases to `main`.
- Never force-push shared branches. Never commit build output, browser artifacts, credentials, tokens, or Cloudflare secrets.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
