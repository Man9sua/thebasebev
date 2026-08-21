# Page topology

## Shared document shell

1. Project-level head code: verification, analytics, canonical/hreflang helper, cart helpers, font links, and custom global CSS.
2. Fixed header (`page62362389`, 9 Tilda records).
3. Route-specific content records.
4. Shared footer (`page62447481`, 19 Tilda records), cookie settings, and four lead popups.

## Shared header

- Effective fixed desktop height: 73 px.
- Effective tablet/mobile height: 61 px at 900 px and below.
- Desktop breakpoint: navigation collapses at 1099 px.
- Desktop content: logo, Shop, Catalog mega-menu, Distributors & Wholesale, Private Label & Custom R&D, About Us, search, region/currency selector, cart, WhatsApp, and Contact Us.
- Mobile/tablet content: logo, search, compact region selector, cart, WhatsApp where space permits, and burger menu.

Interaction model: hover-driven mega-menu, click-driven search/region/cart/mobile menu, keyboard Escape close behavior, and a scrolled state after 40 px. The ticker markup remains in the legacy source, but the final global cascade hides it in current production.

## Homepage

1. Shared header.
2. Five-slide hero carousel (Cream Latte, Milkshake, Matcha, Iced Tea, Cordial).
3. Four numeric business-benefit cards.
4. Popular product grid.
5. Benefits & Advantages.
6. Custom R&D CTA.
7. Free Sample CTA.
8. Company/manufacturing section with metrics.
9. Partnership call CTA.
10. Shared footer and lead popups.

Hero interaction model: time-driven autoplay every 6500 ms plus arrow, dot, keyboard, and swipe controls. Autoplay pauses on pointer/focus interaction. Reduced-motion disables transitions.

## Catalog

1. Shared header.
2. Catalog intro and four filter buttons.
3. Four groups containing 16 locally declared product cards.
4. Hidden Tilda store/catalog record used by existing cart/product-popup scripts.
5. Shared footer and lead popups.

Interaction model: click-driven category filters; scroll-driven reveal; card hover zoom; Add to cart action opens the product/cart flow.

## Product template

Used by 16 pages: 15 share the same 36-record signature, while Garnish adds one record:

1. Shared header.
2. Product hero with package/drink imagery and product-specific background.
3. Hidden/embedded Tilda product and cart data.
4. Product story/benefits blocks.
5. Product gallery/zoom and CTA blocks.
6. Repeated R&D, sample, and partnership CTAs.
7. Shared footer and lead popups.

Interaction model: scroll reveal, hover states, gallery/zoom, cart/product actions, and popup lead forms.

## Company and solution pages

- `/about-us`: company story, facility/team imagery, metrics, certifications, FAQ, shared CTAs/footer.
- `/distributors`: wholesale/distributor proposition, benefits, market/operational sections, lead CTA/footer.
- `/private-labeling`: private-label process and custom R&D sections, lead CTA/footer.
- `/wholesale-strategy`: editorial content blocks and shared CTAs/footer.
- `/contacts`: contact information, contact form/map, shared footer.

## Resource pages

- `/resources`: resource hub cards.
- `/resources/blog`: Tilda feed/list layout.
- `/resources/glossary`: glossary/filter content.
- `/resources/tools`: menu-planning and calculator/tool content.
- `/rnd`: mixed R&D content plus an interactive calorie/nutrition calculator; its current Russian H1 is intentionally recorded as an original-content issue.

## Service pages

- `/terms`, `/privacy`: noindex legal content.
- `/thank-you-form`, `/thank-you-order`: noindex conversion confirmations.
- `/retail`: noindex,nofollow.
- `/not-found`: branded noindex 404 page.
- `/link`: link-in-bio page, robots-disallowed in the original.
- `/cabinet`, `/knowledge-recipes`: empty noindex Tilda Members shells; not part of the public marketing application.
