# Migration notes

Audit baseline: 2026-08-21. The local Tilda export remains the technical source of truth; live production was used only to verify the visual reference.

## Implementation boundary

The current Next.js application is a compatibility layer, not the final component architecture. A static route registry maps production URLs and legacy aliases to exported HTML. The app extracts metadata and server-renders preserved markup so crawlers receive meaningful content without waiting for client JavaScript.

The implementation intentionally preserves Tilda class names and head assets during the parity phase. Because the export body is part of the initial server response, its scripts execute in the browser; selected behavior is verified below. That remains a temporary compatibility runtime, not a substitute for explicit React ports and route-level tests of every popup, calculator, feed, or analytics event.

Current-tree `npm run build`, `npm run cf:build`, typecheck, lint, asset validation, HTTP smoke, and browser smoke complete successfully. The OpenNext build reports its upstream Windows/WSL recommendation; the generated Worker bundle itself completes.

The isolated staging Worker is deployed at `https://the-base-staging.mansua.workers.dev` in Cloudflare account `mansua`. The previous `mnsdemo.workers.dev` Workers remain unchanged in personal account `indukok667` only as rollback/reference. No custom-domain route, production DNS, GoDaddy setting, Tilda project, or Search Console property was changed.

The empty target account started on Workers Free. Initial OpenNext document responses intermittently exceeded its 10 ms CPU limit and returned 503; Worker tail provided exact `exceededCpu` evidence. The final build serves the same prerendered HTML through a generated Static Assets fast path and retains OpenNext for dynamic APIs. Repeated stability, source-target parity, HTTP/browser/commerce/crawler, and production-readiness checks pass on the final target versions.

Cloudflare runtime required two explicit boundaries that local Node does not expose: legacy page aliases are a checked-in audited list rather than a runtime directory scan, and OpenNext uses `staticAssetsIncrementalCache` with cache interception so all build-time SSG responses are deployed as Workers Static Assets. The native branded unknown-path 404 avoids reading the source export from the Worker filesystem; the separate `/not-found` compatibility URL still preserves its exported page.

## Visual reference result

The captured raw export and live production homepage were identical at three audited viewports:

| Viewport | Export SHA-256 | Production SHA-256 | Result |
| --- | --- | --- | --- |
| 1440x1000 | `12ca4d2c412b49067fe0b6476e408322172c475b4a69b06f5ec713bf771bfc3f` | `12ca4d2c412b49067fe0b6476e408322172c475b4a69b06f5ec713bf771bfc3f` | Match |
| 768x1000 | `8846883f529423380cdc6fe6fc2dbda899949c76e33555fb8f75572d636a52ca` | `8846883f529423380cdc6fe6fc2dbda899949c76e33555fb8f75572d636a52ca` | Match |
| 390x844 | `c45afe2f4a05bb3a8ed2999e04484781fe23f1f77eccfb11cab9cdf446ce0a3c` | `c45afe2f4a05bb3a8ed2999e04484781fe23f1f77eccfb11cab9cdf446ce0a3c` | Match |

This establishes that the raw export is a reliable reference. The Next output is additionally captured at 1440, 1280, 1024, 768, 430, 390, 375, 360, and 320 pixels. A same-browser computed-layout audit found matching export/Next hero height, heading width, product image geometry, header utility grid, and breakpoint state at 390px (rounding differences were at most two pixels). The hero has deliberate timed intro motion, so screenshots taken in different animation phases are not expected to have identical hashes.

The homepage hero's small Tailwind utility subset is now compiled locally with Tailwind 3.4.17. The old `cdn.tailwindcss.com` script and its runtime config are replaced in-place with `/css/tbs-tailwind.css`, preserving cascade order while eliminating a network-dependent runtime and `tailwind is not defined` failure.

## Tilda dependency classification

### A. Remove after React replacement

- jQuery and Tilda fallback/polyfill/event/stat/lazy-loading bundles.
- Per-page `tilda-zero`, block initialization, duplicated DOM-ready handlers, and generated animation bootstrap code.
- Tilda menu, popup, slider, zoom, card, tooltip, animation, and feed scripts after equivalent components pass parity checks.
- Duplicate inline initialization and compatibility shims that only support the exported page runtime.

These files stay available as references during parity work; they should not become the permanent production runtime.

### B. Port as visual and interaction components

- Shared header, desktop navigation, mobile navigation, locale/country controls, sticky behavior, and the ticker.
- Homepage hero, product-range sections, responsive transitions, and decorative animation timing.
- Catalog filter/reveal behavior, per-product image scale corrections, product card hover/focus behavior, and catalog popup.
- Product hero/gallery, product navigation, tab/accordion content, FAQs, samples/partner popups, and responsive variants.
- About-page rails, maps, cursor/light effects, and section transitions.
- Footer accordion behavior, cookie notice, contact copy buttons/hours, and responsive layout.
- Resource calculators and other interactive tools that are currently initialized by custom/Tilda JavaScript.

### C. Port as business functionality

- Shared lead forms including Partner with Us, Custom flavour, Free Sample, Custom flavor for your brand, Contact Us, and Join Our Team.
- Field validation, privacy consent, submission states, error recovery, and redirect to `/thank-you-form`.
- Attribution capture: name, email, phone, country, form name, landing page, referrer, and all UTM fields, including `utm_source=chatgpt.com`.
- Catalog/product registry, cart state, original quantity rules including the 10-item cap, order review, checkout/submission, and `/thank-you-order` flow.
- Dynamic catalog/recipe feeds and their detail routes once a real data source is identified.
- Tilda Members placeholders (`/cabinet`, `/knowledge-recipes`) as a separate future module, not part of the public marketing-site runtime.

### D. Preserve or isolate as external integrations

- Analytics discovered in the export: GA4 `G-89J9ZDN1B1`, legacy Google tag `G-VKXMKBRV73`, GTM `GTM-P99PF655`, Tilda GTM `GTM-WPRV8CZ2`, and AdSense `ca-pub-9584440435840838`.
- Google and Bing verification metadata already represented in the root layout.
- Calendly, WhatsApp, Leaflet/CARTO maps, Google Drive links, and other verified external URLs.
- The future lead API and optional Odoo adapter behind a typed server integration boundary.

Do not enable all discovered analytics IDs blindly. The export contains overlapping Google/GTM instrumentation; ownership, current production activity, consent expectations, and duplicate-event behavior must be verified first. No new property or invented ID should be created.

## Forms and attribution blocker

The export contains the form UI, fields, and public receiver hashes, but those hashes do not disclose or replace the owned lead destination. The migration now includes a typed lead model/validator, an allowlisted browser bridge, and `/api/leads`. The bridge captures first-touch landing page, referrer, all required UTM fields, submission page, form identity, consent state, and available contact values. The server route revalidates the payload, requires an HTTPS destination (or localhost), prevents self-recursion, uses a timeout, and forwards with bearer authentication.

This is a prepared integration layer, not proof of successful delivery. Without `LEAD_API_URL` and `LEAD_API_KEY`, the API intentionally returns `503 LEAD_BACKEND_NOT_CONFIGURED`. The allowlist, validation/error/success UX, redirect behavior, actual recipients, and remote endpoint contract still require browser and credentialed end-to-end tests.

Before forms can be marked done, provide or confirm:

- the owned endpoint and confirmation that bearer authentication is the correct mechanism;
- the actual recipient/CRM mapping for every form name;
- retry, spam protection, rate limiting, and delivery-observability requirements beyond the implemented validation/timeout;
- consent copy and retention expectations;
- success/error response contract and whether the original redirect remains authoritative.

Payload preparation and delivery are centralized in the typed integration layer; UI code must continue to avoid mock success responses or scattered credential logic.

## Cart and dynamic-feed boundary

The current compatibility runtime preserves the exported cart behavior. Browser smoke now verifies all 16 catalogue cards, all visible price/request labels, category filtering, add-to-cart for Milkshake at `45.38 AED`, opening the populated checkout dialog, and the product-page `Place order` action opening the shared Free Sample form. The browser audit also confirms that the static fallback uses the same product IDs and prices embedded in the export's `CATG_ADD` table.

Live Tilda obtains the visible catalogue prices from its dynamic store feed, while that feed payload is absent from the export. The Next build therefore seeds the exported price-rendering lookup with the production values audited on 2026-08-21; the original feed loop can still override those values if a real source is connected later. `Topping`, `Tea`, and `Vending` intentionally remain `Price on request`.

This verifies client-side cart and checkout presentation, not order delivery. No real order was submitted. A durable React cart, quantity/persistence behavior, owned order endpoint, payment contract, error UX, and `/thank-you-order` delivery proof still require source-system access and credentialed end-to-end tests.

The export `.htaccess` proxies `/resources/recipes/*` and `/catalog/*` to upstream Tilda feeds. The feed payloads and source system are absent from the export. Exact data access, canonical detail URLs, and update ownership are required before these routes can be rebuilt without inventing content.

## SEO and crawler parity

Implemented in code:

- friendly public routes and local `pageNNNN.html` compatibility aliases;
- canonical/description/Open Graph extraction for mapped pages;
- Google/Bing verification and favicon declarations;
- production-friendly `robots.txt` allowing general crawlers;
- a sitemap registry containing 29 canonical indexable routes;
- five permanent redirect rules for known legacy/typo paths.

Verified from the production build and smoke suite:

- all 39 friendly routes return 200 with crawler-visible server HTML;
- five legacy/typo redirects return the exact intended 301 and `Location`;
- canonical output remains stable after hydration on the audited contacts route;
- robots and the 29-entry sitemap are served, branded unknown paths return 404, and the unconfigured lead API returns an explicit 503;
- all 563 local references found in the exported HTML/CSS resolve under `public/`.

The production-readiness layer additionally provides:

- environment-aware `X-Robots-Tag` so staging and both `workers.dev` previews remain `noindex, nofollow` while page canonicals stay production-oriented;
- a nine-User-Agent crawler audit covering Google, Bing, Apple, OpenAI, Perplexity, and Claude search/user agents;
- an automated 29-route live Tilda vs Worker parity report for status, title, description, H1, canonical, indexability, JSON-LD types, Open Graph, internal links, and image-alt statistics;
- a complete generated route/indexability report explaining 111 controlled routes and five redirects;
- isolated analytics bootstrap that cannot load on preview hosts and never initializes GTM plus direct GA together;
- a minimal uncached `/api/health` endpoint and non-cacheable API responses.

Still requiring deeper page-by-page review: JSON-LD semantic validity, full heading hierarchy, alt coverage, every internal/external link, analytics event duplication, and interactions outside the focused smoke paths.

## Issues found in the original and intentionally preserved

- `/rnd` contains an unrelated Russian calorie calculator and a mismatched H1. It remains a parity issue, not a clone-stage redesign task.
- The 390px original capture shows hero/cookie clipping.
- Header ticker markup exists but is hidden by final CSS.
- Static canonicals omit trailing slashes while a legacy client script may rewrite them.
- `custom.css` is approximately 175 KB and contains more than 110 override layers.
- Product images require category-specific scale/position corrections; uniform normalization would change the design.
- No local font files were found. Google Fonts are external, and the referenced Jost source has not been conclusively identified.
- `page154766476.html` is blank and has no friendly public alias.
- The actual unknown-path 404 is now a native branded React boundary for Cloudflare safety; the source `/not-found` route remains available, but pixel parity of the native 404 boundary is still a follow-up item.

These findings belong in later cleanup/design decisions. They must not be silently changed during the parity phase.

## Phased extraction plan

1. Keep the passing Next/OpenNext, route/SEO, asset, and browser-smoke baselines green.
2. Extend visual comparisons from the current nine-width homepage set to every key route and state.
3. Extract the shared header, desktop/mobile navigation, country controls, footer, and cookie UI while preserving exact markup geometry.
4. Port the homepage section by section, including responsive styles and animation timing.
5. Build a data-driven product template and validate every category-specific layout exception.
6. Port catalog cards, filter/reveal behavior, product details, and cart state without changing product content.
7. Build reusable typed forms, attribution capture, validation, consent, and server delivery once credentials/contracts are available.
8. Replace remaining custom interaction scripts and validate keyboard, touch, reduced-motion, and mobile behavior.
9. Remove unused Tilda assets/runtime only after route-level visual and functional parity checks pass.
10. Build and deploy the staging Worker, run remote HTTP/browser/SEO smoke, and prepare a separate production cutover checklist. Do not connect the production domain in this phase.

## Parity report

| Area | Status | Evidence / blocker |
| --- | --- | --- |
| Export inventory | DONE | 655 export files and route/asset/script relationships were inventoried. |
| Raw export vs live homepage reference | DONE | Captures match at 1440x1000, 768x1000, and 390x844. |
| Friendly route registry | DONE | Existing production slugs are mapped without introducing a new locale hierarchy. |
| Legacy page aliases | DONE | Present local `pageNNNN.html` paths are registered for compatibility and future redirect decisions. |
| Server-rendered export content | DONE | The catch-all compatibility page emits meaningful markup on the server. |
| Known legacy redirects | DONE | Five intended 301 responses and destinations pass built HTTP smoke. |
| Metadata, robots, sitemap, JSON-LD | PARTIAL | Metadata/robots/sitemap/status checks pass; full semantic schema and page-by-page heading/alt review remain. |
| Current-tree Next production build | DONE | Next 16 production build passes and generates 111 static pages plus the lead API route. |
| OpenNext Cloudflare build | DONE | `.open-next/worker.js` and assets are generated successfully. |
| Next.js visual parity | PARTIAL | Nine target widths are captured and representative export/Next geometry is verified; exhaustive route/state diffs remain. |
| Navigation, sliders, popups, calculators | PARTIAL | Hero/header/mobile menu/catalog filter and product-order popup paths pass browser smoke; untested legacy surfaces and React extraction remain. |
| Product details, cart, checkout | PARTIAL | Visible prices, add-to-cart, cart contents, checkout dialog, and Free Sample order popup pass browser smoke; dynamic detail data and real order delivery remain unverified. |
| Form rendering | DONE | Contact form fields render and the allowlisted bridge is exercised in browser smoke. |
| Typed lead payload, first-touch attribution, and API boundary | DONE | Shared validation, allowlisted browser interception, and server forwarding boundary exist in code. |
| Lead delivery and attribution | NEEDS CREDENTIALS | `utm_source=chatgpt.com` first-touch retention and honest unconfigured error UX pass browser smoke; owned delivery credentials remain absent. |
| Analytics continuity | PARTIAL | Existing IDs are inventoried; ownership, duplication, consent, and runtime events need verification. |
| Recipe/catalog dynamic feeds | BLOCKED | Required upstream datasets are absent from the export. |
| Checkout/order delivery | NEEDS CREDENTIALS | UI/state are verified without submission; owned receiver/payment contracts and credentialed end-to-end proof are unavailable. |
| Cloudflare staging | DONE | `the-base-staging.mansua.workers.dev` is deployed in isolated account `mansua`; 39-route HTTP smoke passes remotely. |
| Cloudflare production preview | DONE | Separate `the-base-production.mansua.workers.dev` Worker is deployed without a route/custom domain and remains preview-noindex. |
| Analytics preview isolation | DONE | Exported overlapping tracker runtimes are stripped; controlled GTM-or-GA bootstrap is restricted to exact production hostnames. |
| Production cutover | HUMAN APPROVAL REQUIRED | DNS/domain/Tilda remain untouched; DNS, crawler, cache, cutover, and rollback runbooks are prepared. |
