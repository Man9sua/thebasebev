# Route map

Status meanings:

- `DONE` — represented in the current code or registry; where noted, built HTTP/browser verification is still a separate gate.
- `PARTIAL` — the route server-renders preserved export content, but interaction, visual, or integration parity is not yet proven.
- `BLOCKED` — required source data or authorization is unavailable.
- `NEEDS CREDENTIALS` — implementation or deployment requires an owned external credential/contract.

## Public and service routes

| Old Tilda file / URL | Next.js route | Status | Notes |
| --- | --- | --- | --- |
| `page62361237.html`, `/` | `/` | PARTIAL | Server-rendered; nine responsive captures plus hero/header/region/mobile-menu browser smoke pass. Exhaustive section/state diffs remain. |
| `/main` | `/main` | PARTIAL | Registered duplicate compatibility route with canonical `/`; intentionally not redirected yet. |
| `page147468696.html` | `/wholesale-strategy` | PARTIAL | Indexable content is preserved; page interactions and browser parity remain. |
| `page62585333.html` | `/contacts` | PARTIAL | Contact content, form interception, validation/error UX, canonical stability, and UTM retention are browser-tested; delivery needs credentials. |
| `page62588185.html` | `/about-us` | PARTIAL | Content and exported structured data are preserved; interactive effects need validation/porting. |
| `page151583806.html` | `/resources` | PARTIAL | Indexable landing content is preserved. |
| `page65033993.html` | `/distributors` | PARTIAL | B2B content is preserved; lead delivery needs an owned endpoint. |
| `page151592086.html` | `/resources/blog` | PARTIAL | Indexable listing content is preserved; feed freshness is not guaranteed by the static export. |
| `page120311356.html` | `/private-labeling` | PARTIAL | Indexable content is preserved; lead flow is incomplete. |
| `page155556086.html` | `/sitemap` | PARTIAL | Human-readable sitemap page is preserved; links still need built HTTP smoke. |
| `page151592696.html` | `/resources/glossary` | PARTIAL | Indexable glossary content is preserved. |
| `page151679366.html` | `/resources/tools` | PARTIAL | Content is preserved; custom calculators/interactions need explicit ports and tests. |
| `page155598016.html` | `/rnd` | PARTIAL | Original mixed-language calorie-calculator/H1 mismatch is intentionally preserved. |
| `page62448803.html` | `/raf-coffee` | PARTIAL | Product-template markup is preserved; tabs/gallery/CTA behavior needs verification. |
| `page62494049.html` | `/cream-latte` | PARTIAL | Product-template markup is preserved; product-specific visual corrections remain. |
| `page62497031.html` | `/chai-latte` | PARTIAL | Product-template markup is preserved; product-specific visual corrections remain. |
| `page62508381.html` | `/milkshake` | PARTIAL | Product-template markup is preserved; product-specific visual corrections remain. |
| `page62510271.html` | `/frappe` | PARTIAL | Product-template markup is preserved; product-specific visual corrections remain. |
| `page62515411.html` | `/iced-tea` | PARTIAL | Product-template markup is preserved; product-specific visual corrections remain. |
| `page62539863.html` | `/cordial` | PARTIAL | Product-template markup is preserved; product-specific visual corrections remain. |
| `page62541199.html` | `/topping` | PARTIAL | Product-template markup is preserved; product-specific visual corrections remain. |
| `page62544887.html` | `/matcha` | PARTIAL | Product-template markup is preserved; `Place order` opening the shared Free Sample popup passes browser smoke. Product-specific exhaustive visual review remains. |
| `page62565397.html` | `/chocolate` | PARTIAL | Product-template markup is preserved; product-specific visual corrections remain. |
| `page62566191.html` | `/sugar-syrup` | PARTIAL | Product-template markup is preserved; product-specific visual corrections remain. |
| `page62573319.html` | `/vending` | PARTIAL | Product-template markup is preserved; product-specific visual corrections remain. |
| `page62574449.html` | `/jam` | PARTIAL | Product-template markup is preserved; product-specific visual corrections remain. |
| `page62576005.html` | `/garnish` | PARTIAL | Product-template variant is preserved; responsive/browser parity remains. |
| `page62578053.html` | `/sugar-free` | PARTIAL | Product-template markup is preserved; product-specific visual corrections remain. |
| `page62581091.html` | `/tea` | PARTIAL | Product-template markup is preserved; product-specific visual corrections remain. |
| `page114743626.html` | `/catalog` | PARTIAL | Sixteen cards, five filters, all visible prices/request labels, add-to-cart state, and the populated checkout dialog pass browser smoke. Final order delivery remains unverified and the upstream feed is unavailable. |
| `page77299576.html` | `/thank-you-order` | PARTIAL | Noindex success page is registered; real order delivery is not connected. |
| `page68443067.html` | `/terms` | PARTIAL | Noindex legal page is registered; built metadata/status smoke remains. |
| `page68443503.html` | `/privacy` | PARTIAL | Noindex legal page is registered; built metadata/status smoke remains. |
| `page77849746.html` | `/thank-you-form` | PARTIAL | Noindex success page is registered; real lead submission is not connected. |
| `page154764216.html` | `/cabinet` → `/` | 301 | Empty noindex Tilda Members placeholder removed from public UI; future Partner Hub remains separate. |
| `page114837666.html` | `/retail` | PARTIAL | Original noindex,nofollow page is registered. |
| `page154758576.html` | `/knowledge-recipes` | PARTIAL | Noindex Tilda Members placeholder only; future Partner Hub remains separate. |
| `page115314536.html` | `/not-found` | DONE | Source route is registered and unknown paths return the branded body with HTTP 404. |
| `page65943847.html` | `/link` | PARTIAL | Outside sitemap; original crawler handling is documented for verification. |

The 29 canonical indexable friendly routes are the sitemap candidates. Compatibility/noindex routes are intentionally excluded from that count.

## Legacy HTML aliases

| Old URL | Next.js behavior | Status | Notes |
| --- | --- | --- | --- |
| `/page62362389.html` | Render `page62362389.html` | DONE | Shared header source retained as a noindex compatibility alias/reference. |
| `/page62447481.html` | Render `page62447481.html` | DONE | Shared footer source retained as a noindex compatibility alias/reference. |
| `/page154766476.html` | Render `page154766476.html` | DONE | Blank export page retained; no friendly public slug inferred. |
| Every other present `/pageNNNN.html` file | Render corresponding local export file | DONE | Registered as a direct legacy alias rather than discarded; later redirect decisions require traffic/Search Console evidence. |

`DONE` here means the aliases are represented in the static route registry. The friendly-route HTTP suite is green; direct aliases remain excluded from the canonical sitemap and are retained for future traffic-informed redirect decisions.

## Redirects

| Old URL | Destination | Status | Notes |
| --- | --- | --- | --- |
| `/page65953477.html` | `/` | DONE | Exact 301 and destination pass HTTP smoke. |
| `/page65953593.html` | `/` | DONE | Exact 301 and destination pass HTTP smoke. |
| `/raf-cofeee` | `/raf-coffee` | DONE | Exact typo-route 301 passes HTTP smoke. |
| `/raf-cofee` | `/raf-coffee` | DONE | Exact typo-route 301 passes HTTP smoke. |
| `/functional-wellness` | `/catalog` | DONE | Exact legacy 301 passes HTTP smoke. |

## Dynamic and product compatibility routes

| Old URL family | Next.js behavior | Status | Notes |
| --- | --- | --- | --- |
| `/resources/recipes/*` | No invented replacement | BLOCKED | The Tilda upstream feed payload/dataset is not included in the export. |
| 13 referenced `/catalog/tproduct/*` paths | Render catalog compatibility document | PARTIAL | Paths are retained. The friendly-page cart works, but Tilda's dynamic detail response is absent; final detail/canonical behavior needs the upstream dataset. |
| 13 referenced `/tproduct/*` paths | Render catalog compatibility document | PARTIAL | Alternate compatibility family is retained; final detail/redirect/canonical behavior needs source data and traffic evidence. |

## Technical routes

| Route | HTTP behavior | Indexable | Sitemap | Status / reason |
| --- | --- | --- | --- | --- |
| `/robots.txt` | 200 | NO | NO | DONE — crawler policy document |
| `/sitemap.xml` | 200 | NO | NO | DONE — contains exactly 29 canonical public pages |
| `/api/health` | 200 JSON, `no-store` | NO | NO | DONE — safe deployment probe returning only `status: ok` |
| `/api/leads` GET | 405 | NO | NO | DONE — POST-only typed delivery boundary |
| `/api/leads` POST invalid payload | 400 | NO | NO | DONE — safe validation boundary used by automated smoke |
| `/api/checkout/stripe` GET | 405 | NO | NO | DONE — POST-only Test Mode checkout POC |
| `/api/stripe/webhook` GET | 405 | NO | NO | DONE — POST-only signed Test Mode webhook boundary |
| unknown path | branded 404 | NO | NO | DONE — native not-found boundary |

`ROUTE_INDEXABILITY_AUDIT.md` accounts for all 113 generated/technical routes plus the five redirects and records why each item is or is not indexable.

## Deployment and integration gates

| Area | Status | Notes |
| --- | --- | --- |
| Local Next route foundation | DONE | App Router registry and server-rendered compatibility document exist. |
| Clean current-tree Next build | DONE | Production build and HTTP/browser smoke pass. |
| OpenNext Worker bundle | DONE | OpenNext build completes and generates the Worker output. |
| Forms/lead delivery | STAGING VERIFIED | One controlled Odoo lead confirmed field mapping, request ID and `utm_source=chatgpt.com`; production enablement remains human-controlled. |
| Checkout/order delivery | NEEDS CREDENTIALS | Cart state and checkout UI pass browser smoke; a real order was intentionally not submitted, and the owned delivery/payment contract is unavailable. |
| Cloudflare staging | PARTIAL | Version `daa6c072-728d-4c24-9e96-7856b048b41f` is deployed in `mansua`; Error 1027 blocks post-deploy remote checks until the account quota resets. No production route is configured. |
| Cloudflare production preview | DONE | Separate `the-base-production.mansua.workers.dev` Worker is deployed, has preview noindex, and has no custom domain. |
| Production domain/DNS | HUMAN APPROVAL REQUIRED | Explicitly outside preparation scope and intentionally untouched. |
