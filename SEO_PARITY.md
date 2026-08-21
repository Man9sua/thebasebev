# SEO parity

This document records the SEO contract for the first-stage Tilda to Next.js migration. The local export in `tilda_export/project12027355` is the technical source of truth. Content defects found in that export are documented rather than silently rewritten.

## Runtime contract

- Public pages render crawl-critical metadata in the server response through the Next.js metadata API.
- Canonical URLs use the exported static form without a trailing slash. The old post-load JavaScript that changed canonicals to trailing-slash variants is intentionally not reproduced.
- `<html lang="en">`, verification tags, favicon metadata, Open Graph, Twitter metadata, robots directives, and canonical links are rendered without waiting for client JavaScript.
- `robots.txt` allows all Search and AI search crawlers through the `User-agent: *` rule and references only `https://thebasebev.com/sitemap.xml`.
- `sitemap.xml` contains exactly the 29 audited canonical/indexable pages and their exported `lastmod` values.
- Legal, thank-you, retail, members, branded not-found, link-in-bio, direct Tilda page aliases, and product-feed aliases stay out of the sitemap.
- The five audited permanent redirects are configured in `next.config.ts`.

## Canonical and indexable pages

`Common graph` means the source JSON-LD containing `Organization` + `Manufacturer`, `WebSite`, and an `OfferCatalog` with 16 product lines. `Common graph + FAQ` includes the additional five-question `FAQPage` found on the About page.

| URL | Title | Description | Canonical | H1 | Indexable | Structured data | Status |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `/` | Dry Beverage Premix Manufacturer \| Global HORECA Supply | The Base manufactures 600+ premium dry beverage premixes for HORECA and retail businesses worldwide, with private labeling and global shipping. | `https://thebasebev.com` | Premium Cream Latte Bases | Yes | Common graph | DONE |
| `/wholesale-strategy` | Wholesale Strategy and Market Insights \| The Base | Wholesale beverage distribution in the GCC: margins, MOQ, supplier checklist and the mistakes that cost money. Practical guide from The Base, Dubai. | `https://thebasebev.com/wholesale-strategy` | Wholesale Beverage Distribution in GCC | Yes | Common graph | DONE |
| `/contacts` | Contact The Base Beverage \| B2B Orders & Inquiries | Reach out to The Base Beverage team for product inquiries, B2B orders, custom beverage solutions, or distribution opportunities. Located in Dubai – working globally. | `https://thebasebev.com/contacts` | Contact Us | Yes | Common graph | DONE |
| `/about-us` | About The Base Beverage \| Ingredients Manufacturer from Dubai | Learn about The Base Beverage – a Dubai-based manufacturer of high-quality dry bases and beverage ingredients. We offer custom solutions, OEM, and global B2B support. | `https://thebasebev.com/about-us` | Who we are | Yes | Common graph + FAQ | DONE |
| `/resources` | Resources \| Beverage Base Guides & Tools from The Base | Guides, glossary, and tools for beverage bases and Horeca supply. Practical resources for cafes, restaurants, and distributors working with The Base. | `https://thebasebev.com/resources` | Resources for HORECA Professionals | Yes | Common graph | DONE |
| `/distributors` | Beverage Distributors in Dubai \| Wholesale & Online Supply | Partner with The Base Beverage, leading beverage distributors in Dubai. Bulk supply for cafés & restaurants, plus retail packs for households. | `https://thebasebev.com/distributors` | Become a distributor of The Base | Yes | Common graph | DONE |
| `/resources/blog` | B2B Beverage Blog \| The Base | Practical guidance on beverage bases and B2B supply for cafés, restaurants, and distributors. Insights on matcha, iced tea, cold foam, and menu economics from The Base. | `https://thebasebev.com/resources/blog` | Blog | Yes | Common graph | DONE; empty exported OG description noted below |
| `/private-labeling` | Private Label & Wholesale Premixes, Made in UAE \| The Base | Beverage premixes under your own brand. 16 product lines in powder form, custom development & contract manufacturing. Made in UAE — fast, scalable B2B supply. | `https://thebasebev.com/private-labeling` | Wholesale and Private Labeling | Yes | Common graph | DONE |
| `/sitemap` | Sitemap \| The Base Beverage | Full sitemap of thebasebev.com: company pages, product catalog, resources, and legal pages. | `https://thebasebev.com/sitemap` | Sitemap | Yes | Common graph | DONE |
| `/resources/glossary` | Beverage Glossary \| The Base | Clear definitions of key beverage and HoReCa supply terms, from base powders to garnishes. A quick reference for cafés, restaurants and distributors. | `https://thebasebev.com/resources/glossary` | Glossary | Yes | Common graph | DONE |
| `/resources/tools` | HoReCa Cost Calculator & Tools \| The Base | Free B2B HoReCa cost calculator from The Base. Estimate ingredient costs, portion pricing, and margins for cafes, restaurants, and beverage programs. | `https://thebasebev.com/resources/tools` | Tools for Menu Planning | Yes | Common graph | DONE |
| `/rnd` | Beverage R&D and Product Development Dubai \| The Base | Custom beverage R&D in Dubai: recipe development, flavour matching and pilot batches for HORECA and private label brands across the UAE and GCC. | `https://thebasebev.com/rnd` | Узнай свою дневную норму за 30 секунд | Yes | Common graph | DONE; source-language H1 mismatch preserved |
| `/raf-coffee` | Raf Coffee Mix Powder UAE \| Wholesale & Retail Supply | Premium Raf Coffee mix powder in UAE. Bulk supply for cafés, restaurants & retailers, plus retail packs for households. Fast delivery and rich taste. | `https://thebasebev.com/raf-coffee` | Raf Coffee | Yes | Common graph | DONE |
| `/cream-latte` | Cream Latte Powder Mix \| Smooth Coffee Base for Horeca & OEM | Serve creamy coffee drinks with our premix powder – no cream required. Ideal for cafés, foodservice, and beverage brands. Perfect texture with dairy or plant-based milk. | `https://thebasebev.com/cream-latte` | Cream Latte Base – Rich, Smooth, and Easy to Prepare | Yes | Common graph | DONE |
| `/chai-latte` | Chai Latte Powder Mix \| Spiced Beverage Base for Horeca | Serve bold and comforting chai lattes with our easy-to-mix powder base. Perfect for cafés, franchises, and OEM beverage concepts. Warm spices, no extra prep needed. | `https://thebasebev.com/chai-latte` | Chai Latte Base – Authentic, Spiced, and Easy to Prepare | Yes | Common graph | DONE |
| `/milkshake` | Milkshake Powder Wholesale UAE \| Bulk & Retail Supply | Premium milkshake powder in UAE. Bulk supply for cafés, restaurants & retailers, plus retail packs for households. Fast delivery and rich flavors. | `https://thebasebev.com/milkshake` | Milkshake Base Powder – Thick, Creamy & Easy to Blend | Yes | Common graph | DONE |
| `/frappe` | Frappe Mix Wholesale UAE \| Vanilla & Bulk Supply | Premium frappe mix in UAE. Bulk supply for cafés, restaurants & retailers, plus retail packs for households. Vanilla and other flavors with fast delivery. | `https://thebasebev.com/frappe` | Frappe Base for Smooth, Creamy Blended Beverages | Yes | Common graph | DONE |
| `/iced-tea` | Iced Tea Powder UAE \| Wholesale & Retail Supply | Premium iced tea powder in UAE. Bulk supply for cafés, restaurants & retailers, plus retail packs for households. Refreshing flavors with fast delivery. | `https://thebasebev.com/iced-tea` | Iced Tea Base for Refreshing, Crisp, Ready-to-Mix Beverages | Yes | Common graph | DONE |
| `/cordial` | Sweet Cordials & Premix Powder UAE \| Bulk & Retail | Premium sweet cordials and premix powder in UAE. Bulk supply for cafés, restaurants & retailers, plus retail packs for households. Fast delivery. | `https://thebasebev.com/cordial` | Cordial Drink Powders – Add Bold Fruit & Spice Flavors | Yes | Common graph | DONE |
| `/topping` | Drink and Dessert Toppings \| Horeca Ingredients by The Base | Choose from a variety of premium toppings for bubble tea, smoothies, desserts, and more. Designed for Horeca clients – eye-catching, flavorful, and easy to serve. | `https://thebasebev.com/topping` | Professional Toppings for Drinks and Desserts | Yes | Common graph | DONE |
| `/matcha` | Matcha Powder Dubai \| UAE Wholesale & Retail Supply | Premium matcha powder in Dubai. Bulk supply for cafés, restaurants & retailers, plus retail packs for households. Trusted UAE supplier with fast delivery. | `https://thebasebev.com/matcha` | Matcha Beverage Base – Perfect for Cafés, Franchises & OEM | Yes | Common graph | DONE |
| `/chocolate` | Cocoa Powder UAE \| Wholesale & Online Retail Supply | Premium cocoa powder in UAE. Bulk supply for cafés, bakeries & retailers, plus retail packs for households. Fast delivery with rich, smooth taste. | `https://thebasebev.com/chocolate` | Chocolate Beverage Base for Cafés, Bars & OEM Use | Yes | Common graph | DONE |
| `/sugar-syrup` | Sugar Syrup for Beverages \| Premium Ingredient by The Base | Order premium sugar syrup for your café, restaurant or OEM beverage project. Versatile liquid sugar for professional use — smooth texture, easy mixing. | `https://thebasebev.com/sugar-syrup` | Sugar Syrup for Cafés, Bars & Beverage Brands | Yes | Common graph | DONE |
| `/vending` | Vending Drink Powders \| The Base Beverage Solutions for Machines | Vending-optimised drink powders for coffee, tea and flavoured beverages. Built for automatic machines: consistent quality, fast dispensing, low waste. | `https://thebasebev.com/vending` | Vending Machine Drink Powders for Automatic Dispensing | Yes | Common graph | DONE |
| `/jam` | Fruit Jams and Fillings \| Horeca & Beverage Industry Solutions | Explore our range of fruit jams and fillings – perfect for desserts, beverages, or bakery use. Designed for Horeca and B2B clients with consistent texture and rich taste. | `https://thebasebev.com/jam` | Premium Jam and Fruit Fillings for Cafés, Bakeries & Beverages | Yes | Common graph | DONE |
| `/garnish` | Beverage & Dessert Garnishes \| Horeca Supply by The Base | Halal certified garnish powder for cafés, restaurants, and dessert brands in Dubai. Bulk supply for Horeca, plus retail packs for households. Fast delivery. | `https://thebasebev.com/garnish` | Professional Garnishes for Beverages and Desserts | Yes | Common graph | DONE |
| `/sugar-free` | Sugar Free Beverages UAE \| Wholesale & Retail Supply | Healthy sugar free beverages in UAE. Bulk supply for cafés, restaurants & retailers, plus retail packs for households. Fast delivery & premium taste. | `https://thebasebev.com/sugar-free` | Sugar-Free Beverage Bases for Cafés, Restaurants & Distributors | Yes | Common graph | DONE |
| `/tea` | Green Tea Powder & Tea Bags UAE \| Wholesale & Retail | Premium green tea powder and tea bags in UAE. Bulk supply for cafés, restaurants & retailers, plus retail packs for households. Fast delivery. | `https://thebasebev.com/tea` | Tea-Based Drink Powders for Cafés, Bars & OEM Projects | Yes | Common graph | DONE |
| `/catalog` | Catalog \| Beverage Base Premixes by The Base | Browse our full range of beverage premixes: matcha, milkshake, chai latte, iced tea, and more. Bulk supply for cafes, restaurants, and distributors. | `https://thebasebev.com/catalog` | Beverage Base Premixes — Wholesale Catalogue | Yes | Common graph | DONE |

## Sitemap last-modified parity

The 29 values below are copied from the exported `sitemap.xml`; they are not generated from build time or the current clock.

| URL | Exported `lastmod` |
| --- | --- |
| `/` | `2026-08-20T20:38:39+00:00` |
| `/wholesale-strategy` | `2026-08-20T14:18:41+00:00` |
| `/contacts` | `2026-08-20T14:18:43+00:00` |
| `/about-us` | `2026-08-20T14:18:45+00:00` |
| `/resources` | `2026-08-20T14:18:46+00:00` |
| `/distributors` | `2026-08-20T14:18:49+00:00` |
| `/resources/blog` | `2026-08-20T14:18:50+00:00` |
| `/private-labeling` | `2026-08-20T14:18:53+00:00` |
| `/sitemap` | `2026-08-20T14:18:55+00:00` |
| `/resources/glossary` | `2026-08-20T14:18:56+00:00` |
| `/resources/tools` | `2026-08-20T14:18:57+00:00` |
| `/rnd` | `2026-08-20T14:19:00+00:00` |
| `/raf-coffee` | `2026-08-20T14:19:05+00:00` |
| `/cream-latte` | `2026-08-20T14:19:06+00:00` |
| `/chai-latte` | `2026-08-20T14:19:08+00:00` |
| `/milkshake` | `2026-08-20T14:19:09+00:00` |
| `/frappe` | `2026-08-20T14:19:11+00:00` |
| `/iced-tea` | `2026-08-20T14:19:12+00:00` |
| `/cordial` | `2026-08-20T14:19:14+00:00` |
| `/topping` | `2026-08-20T14:19:15+00:00` |
| `/matcha` | `2026-08-20T14:19:16+00:00` |
| `/chocolate` | `2026-08-20T14:19:18+00:00` |
| `/sugar-syrup` | `2026-08-20T14:19:19+00:00` |
| `/vending` | `2026-08-20T14:19:20+00:00` |
| `/jam` | `2026-08-20T14:19:22+00:00` |
| `/garnish` | `2026-08-20T14:19:23+00:00` |
| `/sugar-free` | `2026-08-20T14:19:25+00:00` |
| `/tea` | `2026-08-20T14:19:26+00:00` |
| `/catalog` | `2026-08-20T14:19:28+00:00` |

## Important excluded routes

The runtime emits `noindex` for these routes and omits them from the sitemap. A dash means the export had no meaningful value.

| URL | Title | Description | Canonical | H1 | Indexable | Structured data | Status |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `/main` | Dry Beverage Premix Manufacturer \| Global HORECA Supply | The Base manufactures 600+ premium dry beverage premixes for HORECA and retail businesses worldwide, with private labeling and global shipping. | `https://thebasebev.com` | Premium Cream Latte Bases | No | Common graph | DONE; duplicate homepage alias consolidated |
| `/thank-you-order` | Your order has been successfully placed | after order | `https://thebasebev.com/thank-you-order` | Thank you for your order. | No | Common graph | DONE |
| `/terms` | Terms & Conditions | — | `https://thebasebev.com/terms` | Terms and Conditions | No | Common graph | DONE; original noindex preserved |
| `/privacy` | Privacy Policy | — | `https://thebasebev.com/privacy` | Privacy Policy | No | Common graph | DONE; original noindex preserved |
| `/thank-you-form` | Thank you form page | — | `https://thebasebev.com/thank-you-form` | Thank you for reaching out. | No | Common graph | DONE |
| `/cabinet` | — | — | `https://thebasebev.com/cabinet` | — | No | None | PARTIAL; empty Tilda Members shell only |
| `/retail` | Retail | — | `https://thebasebev.com/retail` | BRING THE BASE TO YOUR SHELVES | No, nofollow | Common graph | DONE; original noindex/nofollow preserved |
| `/knowledge-recipes` | — | — | `https://thebasebev.com/knowledge-recipes` | — | No | None | PARTIAL; empty Tilda Members shell only |
| `/not-found` | Page not found | — | `https://thebasebev.com/not-found` | Error 404 | No | Common graph | DONE; branded route preserved |
| `/link` | Link in Bio | A minimalist link in bio page with a profile picture and black rectangular buttons | `https://thebasebev.com/link` | — | No | None | DONE; export robots-only exclusion normalized to static noindex |

All direct `pageNNNN.html` aliases and known `/tproduct/*` aliases are generated as `noindex` compatibility routes and are not included in the sitemap. Shared export pages `page62362389.html` and `page62447481.html` are component sources for the header and footer, not canonical public pages. `page154766476.html` is an exported blank page and remains excluded.

## Redirect parity

| Old URL | Destination | Status |
| --- | --- | --- |
| `/page65953477.html` | `/` | DONE, exact 301 preserved and HTTP-smoked |
| `/page65953593.html` | `/` | DONE, exact 301 preserved and HTTP-smoked |
| `/raf-cofeee` | `/raf-coffee` | DONE, exact 301 preserved and HTTP-smoked |
| `/raf-cofee` | `/raf-coffee` | DONE, exact 301 preserved and HTTP-smoked |
| `/functional-wellness` | `/catalog` | DONE, exact 301 preserved and HTTP-smoked |

The redirect rules use explicit `statusCode: 301`, matching the Tilda Apache export rather than Next.js's default permanent 308 behavior.

## Verification and discoverability

- Google verification: `gw6ZHJAqgrcIapYsvjt5SMRjnp3bR4uutMMrFQKGaUQ` — DONE in root metadata.
- Bing verification: `A011A869D7E602B7D45AA6063AA4D6BE` — DONE in root metadata.
- `robots.txt` has no Googlebot, Bingbot, OAI-SearchBot, ChatGPT-User, PerplexityBot, Claude, training, or other AI-specific block.
- General crawler access is allowed. Page-level `noindex` metadata controls exclusions so crawlers can read the directive.
- Only the existing canonical sitemap is advertised. The absent Tilda `sitemap-store.xml` and `sitemap-feeds.xml` are intentionally not referenced.

## Source defects intentionally documented

- The Tilda static canonical and sitemap URLs omit trailing slashes, but shared client JavaScript changed canonical URLs to trailing-slash variants after load. The migration keeps the static no-trailing-slash form.
- Tilda served both slash variants without redirecting one to the other. The current compatibility configuration keeps that behavior while emitting one canonical.
- `/resources/blog` has a non-empty meta description but an empty exported Open Graph description.
- Homepage, distributors, frappe, and garnish use deliberately different exported meta and Open Graph copy. Those values are preserved.
- `/rnd` has an English R&D title and description but a Russian nutrition-calculator H1. It is preserved for clone parity and should be reviewed after parity.
- Only 8 of 29 canonical pages have an exported `og:image`. The other pages retain the shared exported Twitter image rather than inventing new artwork.
- Tilda Twitter tags were injected only after page load and reused generic homepage values on every normal page. The migration renders those audited values statically.
- The common JSON-LD uses relative image paths and is repeated on unrelated legal, thank-you, and error pages. It is preserved as source content for clone parity; absolute URLs and route-specific schema are post-parity improvements.
- The exported RSS feed includes the blank page and excluded routes. RSS cleanup is pending and must not expand the sitemap.

## Dynamic feed blockers

| Surface | Export behavior | Migration status |
| --- | --- | --- |
| `/resources/recipes` and `/resources/recipes/*` | Apache proxy to `127.0.0.1:39215` with Tilda feed UID `111700959881` | BLOCKED: upstream content/data is absent from the export |
| `/catalog/*` store/feed paths | Apache proxy to `127.0.0.1:39216/tcatalog` | PARTIAL: known product aliases use the exported catalog shell; original dynamic upstream is unavailable |
| `/members/*` | Apache rewrite to `ma_start.html` | BLOCKED: `ma_start.html` and member backend are absent |
| `/sitemap-store.xml` | Advertised by old robots file but absent from export | BLOCKED/OMITTED: not advertised by the new robots runtime |
| `/sitemap-feeds.xml` | Advertised by old robots file but absent from export | BLOCKED/OMITTED: not advertised by the new robots runtime |

These blockers require the original Tilda feed data or replacement backend integration. They do not justify publishing fabricated URLs in the canonical sitemap.

## Status summary

- Canonical metadata for 29 public pages: DONE.
- Exactly 29 exported sitemap entries and last-modified values: DONE.
- Search and AI crawler-friendly robots runtime: DONE.
- Verification metadata: DONE.
- Five audited permanent redirects: DONE as exact 301 responses.
- Static structured data: PRESERVED from the export; source defects documented.
- Dynamic recipes, members, and complete Tilda store feeds: BLOCKED/PARTIAL pending upstream data.

## Preview and production indexability boundary

- `the-base-staging.mnsdemo.workers.dev`: transport `X-Robots-Tag: noindex, nofollow`.
- `the-base-production.mnsdemo.workers.dev`: transport `X-Robots-Tag: noindex, nofollow` despite `APP_ENV=production`, because it is still a preview hostname.
- `thebasebev.com` and `www.thebasebev.com`: eligible for indexable delivery only when `APP_ENV=production` after explicit cutover approval.
- Canonical and OG URLs remain rooted at `https://thebasebev.com` in every environment.

`SEO_PARITY_REPORT.md` is generated by `npm run audit:seo-parity -- <target-url>` and compares all 29 canonical routes to current live Tilda. `ROUTE_INDEXABILITY_AUDIT.md` explains every generated route, technical endpoint, and redirect.
