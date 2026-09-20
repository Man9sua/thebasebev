# Prelaunch integration merge matrix

Generated: 2026-08-24

## Inputs

| Source | Commit | Role | Result |
| --- | --- | --- | --- |
| Migration checkpoint | `43d629a` | Odoo read-only audit, Stripe Test POC, Cloudflare isolation baseline | preserved on `backup/pre-redesign-integration` |
| `origin/main` / `origin/develop` | `3a75184` | merged redesign, lead pipeline, product-first hero, Guidebook brand system | ancestry reviewed |
| Latest visual branch | `origin/feature/marquee-hero` at `c63198e` | newest homepage/loading/marquee work, descendant of `main` and `feature/redesign` | selected as visual source |
| Integration merge | `8e4cf79` | controlled merge into `integration/prelaunch` | completed without force push |

## Resolution rules

| Area | Authoritative source | Resolution |
| --- | --- | --- |
| Homepage visual system, hero, loading gate, brand typography and motion | latest visual branch | adopted |
| Existing public URLs and compatibility pages | migration baseline | preserved |
| OpenNext wrapper, Static Assets fast path, account ID and workers.dev-only environments | migration baseline | preserved |
| Lead UI/validation and Tilda-compatible field vocabulary | lead pipeline branch | adopted and extended |
| First-touch attribution across redesigned and legacy routes | combined | bridge moved to root layout |
| Odoo attribution persistence | combined | flat fields plus structured description-compatible block; Odoo automation unchanged |
| Stripe | migration checkpoint | remains isolated Test Mode POC only |
| Analytics | migration baseline | one production-host-only loader; GTM precedence, GA fallback |
| Domain, DNS, Tilda and Search Console | neither branch may mutate | untouched |

## Functional reconciliation

| Contract | Status | Evidence |
| --- | --- | --- |
| Redesign homepage is the public `/` | DONE | local browser smoke at nine widths |
| Legacy public pages remain available | DONE | 113-route audit, 29 sitemap URLs, five redirects |
| Navigation/search/cart links are real | DONE | browser and commerce smoke |
| All allowlisted lead forms use `/api/leads` | DONE | browser interception and 42-check mocked pipeline audit |
| First-touch `utm_source=chatgpt.com` survives homepage to contact navigation | DONE | browser smoke and controlled Odoo verification |
| Stripe cannot run on production hostname or with Live keys | DONE | 15 automated tests |
| Telegram parity | NEEDS CREDENTIALS | no bot/chat configuration supplied |
| Stripe webhook delivery | NEEDS HUMAN SETUP | `STRIPE_WEBHOOK_SECRET` absent |
| Post-deploy remote regression suite | BLOCKED | Cloudflare account Free quota returns Error 1027 until daily reset |

No merge was made into `main` or `develop`.
