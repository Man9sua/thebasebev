# THE BASE Tilda export inventory

Audit date: 2026-08-21

## Source of truth

- Local export: `tilda_export/project12027355/`
- Production reference: `https://thebasebev.com/`
- The homepage production and export viewport screenshots are byte-identical at 1440×1000, 768×1000, and 390×844.
- The export sitemap was last updated on 2026-08-20 and is treated as the primary technical source for this migration.

## File inventory

| Kind | Count |
| --- | ---: |
| Total files | 655 |
| Total bytes | 139,775,617 |
| Root HTML | 42 |
| Exported body fragments | 39 |
| PNG | 211 |
| SVG | 141 |
| JavaScript | 82 |
| CSS | 60 |
| JPG | 59 |
| WebP | 14 |
| XML | 2 |
| TXT | 2 |
| MP4 | 1 |
| ICO | 1 |

No local WOFF/WOFF2/TTF/OTF files are present. The export loads Exo, Exo 2, Inter, and Roboto from Google Fonts; Jost and Source Serif 4 occur as fallbacks in custom CSS but are not loaded by the export.

## Public and service pages

- 29 canonical/indexable routes are listed in `sitemap.xml`.
- 10 additional friendly routes are outside the sitemap (`/main`, legal, thank-you, retail, members, 404-style, and link pages).
- 41 direct `pageNNNN.html` legacy files exist.
- Shared header source: `page62362389.html`, embedded as Tilda page ID `62362389`.
- Shared footer source: `page62447481.html`, embedded as Tilda page ID `62447481`.
- Unmapped `page154766476.html` is a Tilda “Blank page”.
- `partner-hub-prototype.html` is not present in the audited export.

## Repeated templates

- Fifteen product pages share the same 36-record Tilda topology: Raf Coffee, Cream Latte, Chai Latte, Milkshake, Frappe, Iced Tea, Cordial, Topping, Matcha, Chocolate, Sugar Syrup, Vending, Jam, Sugar Free, and Tea.
- Garnish uses the same product template plus one extra record.
- All normal public pages embed the same 9-record header and 19-record footer.
- Homepage, catalog, about, distributors, private labeling, wholesale strategy, resources pages, contacts, and R&D have distinct content topologies.

## Forms

The shared footer contains four zero-block lead form variants:

- `Partner with Us`
- `Custom flavour`
- `Free Sample`
- `Custom flavor for your brand`

All four require full name, email, phone, and privacy-policy consent, then redirect to `/thank-you-form`. `/about-us` and `/contacts` contain page-specific forms; cart checkout forms also exist on the main site and `/link`. Their delivery destinations cannot be recovered from the public receiver hashes and are documented as an integration blocker.

## Analytics and verification

Detected public IDs:

- GA4: `G-89J9ZDN1B1`
- Additional legacy GA destination: `G-VKXMKBRV73`
- GTM: `GTM-P99PF655`
- Tilda-configured GTM: `GTM-WPRV8CZ2`
- Tilda statistics key: `19f02e77cec2c7049a298e406849974c`
- Google Search Console verification: `gw6ZHJAqgrcIapYsvjt5SMRjnp3bR4uutMMrFQKGaUQ`
- Bing verification: `A011A869D7E602B7D45AA6063AA4D6BE`
- AdSense client: `ca-pub-9584440435840838`

## Tilda dependency classification

### A. Compatibility-only and removable after React parity

- jQuery 1.10.2
- generic Tilda bootstrap/polyfill/events/stat/fallback code
- generated per-page `tilda-blocks-page*.js`
- Tilda lazy loader once native image behavior is verified

### B. Visual behavior to reimplement

- Zero Block layout/scaling and top-shift logic
- reveal animations
- hero/product sliders, zoom, and swipe handling
- popup and mobile-menu transitions
- custom scroll/visibility observers

### C. Business functionality to replace

- Tilda forms and phone validation
- Tilda cart, product popup, quantity cap, and checkout
- catalog/store product runtime
- Tilda member pages (kept separate from the public website)

### D. External integrations to preserve/configure

- GA4/GTM/AdSense
- Google/Bing verification
- Calendly
- WhatsApp
- Leaflet + CARTO map tiles
- Google Drive catalog download

## Missing dynamic sources

The Apache export proxies `/resources/recipes/*` and `/catalog/*` to local Tilda upstream processes. Those upstream datasets are not included in the static export. The visible catalog itself is available as local custom HTML with 16 product-category cards, while 13 hidden Tilda product-detail URLs are referenced for cart behavior.
