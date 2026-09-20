# THE BASE agent context

Project: THE BASE

- Production: `https://thebasebev.com`
- Current production runtime: Tilda
- New runtime: Next.js + TypeScript + Cloudflare Workers/OpenNext
- Cloudflare account for THE BASE: `mansua` (`678720af4dded7d23aad4a859b6e5f3a`).
- Staging: `https://the-base-staging.mansua.workers.dev`
- Production preview: `https://the-base-production.mansua.workers.dev`; it is not the production domain.
- Legacy source account: `indukok667`; rollback/reference only. Personal infrastructure in this account is not part of THE BASE.

The migration must preserve SEO, organic Google traffic, AI/Search referrals, existing URLs, forms and attribution, and design parity. The local Tilda export is the content/design reference; live production is a read-only comparison target.

## Critical rules

- DO NOT modify production DNS or GoDaddy.
- DO NOT connect `thebasebev.com` without explicit human approval.
- DO NOT remove or modify Tilda.
- DO NOT change production URLs or redesign during parity/migration work.
- DO NOT introduce `noindex` on the real production hostname.
- DO NOT expose secrets or commit real `.env`/`.dev.vars` files.
- DO NOT deploy THE BASE to personal account `indukok667` or touch any resource in it.
- Invite teammates manually only to Cloudflare account `mansua`.
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

`npm run cf:build` must run the generated Static Assets document fast path. It keeps the current public SSG pages below the `mansua` Workers Free 10 ms CPU limit. Do not bypass/remove it without Worker error-tail, repeated stability, route, browser, crawler, and source-target parity checks.

## Required checks

After substantial changes run, at minimum:

```bash
npm run typecheck
npm run lint
npm run audit:leads
npm run test:stripe
npm run build
npm run cf:build
npm run check:assets
npm run audit:commerce -- <target-url>
npm run smoke:http -- <target-url>
npm run smoke:browser -- <target-url>
npm run audit:routes -- <target-url>
npm run audit:seo-parity -- <target-url>
npm run audit:crawlers -- <target-url>
npm run audit:cloudflare-parity
npm audit
```

`npm run audit:production-readiness -- <target-url>` is the sequential full orchestrator. It performs remote read-only tests and does not submit a lead or order. The HTTP audit sends only an invalid lead payload, and browser smoke mocks `/api/leads`.

Before changing Next.js APIs, read the relevant guide under `node_modules/next/dist/docs/`. Before every deployment, verify that Wrangler selects account `mansua` and exact account ID `678720af4dded7d23aad4a859b6e5f3a`. Deploy staging only when the current task explicitly authorizes it; the prelaunch integration workflow is such authorization. Production-preview and the production domain require separate human approval. Never add a custom domain during migration preparation.

## Definition of done

Every generation task ends with these three steps, in this order. None of them is optional and none of them is a separate request: code that compiles is not finished work.

1. **Refactor what was just generated.** Re-read it before shipping. Hoist work that does not belong in a render, delete whatever the change made dead, collapse duplicated branches, and match the naming and comment density of the file it lives in. Then re-run the required checks above — a refactor that was not re-verified did not happen.
2. **Push to GitHub.** Commit onto a `feature/*`, `fix/*` or `migration/*` branch — never straight onto `main` or `develop` — push to `origin`, and open a PR toward `develop`. One commit message that says what changed and why, per the Git workflow below.
3. **Deploy to Cloudflare staging.** `npm run deploy:staging`, then verify with `npm run smoke:http`, `npm run smoke:browser` and `npm run audit:crawlers` against the URL wrangler prints. Staging must come back `noindex, nofollow` at the transport layer, and canonicals must still point at `https://thebasebev.com`.

   The authoritative staging Worker is `the-base-staging.mansua.workers.dev`. The older `mnsdemo.workers.dev` Worker is rollback/reference only. The generated Static Assets document fast path is required because it resolved the target account's earlier Worker CPU-limit failures; do not remove it based on a local-only result.

Report each step's real outcome. A failed deploy or a failing check is reported as failed, never smoothed over.

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
