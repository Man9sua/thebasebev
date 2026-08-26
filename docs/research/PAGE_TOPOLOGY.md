# Public page topology

## Routing

`src/app/[[...path]]/page.tsx` is the single public catch-all. `site-pages.ts`
maps friendly and audited legacy paths to the corresponding static Tilda export.

1. `/` renders the React `HomePage`.
2. Normal public routes render one `SiteHeader`, a `LegacyPageShell`, and one
   `SiteFooter`.
3. Standalone exported header/footer aliases render `LegacyDocument` without a
   second shell.
4. `/cabinet` permanently redirects to `/`; it is not a public application.
5. Unknown routes use the application 404.

## Canonical shared shell

- `SiteHeader`: fixed brand navigation, catalogue mega menu, search, region,
  cart and mobile drawer. No account/cabinet UI.
- `SiteFooter`: the homepage footer is the canonical implementation on every
  public route, including the large responsive BASE wordmark.
- Tilda shell records are stripped server-side, while JSON-LD, cart, lead forms,
  cookie consent and required integrations are retained.

## Homepage

1. Real-signal 0-100 initial loading gate.
2. Shared dynamic header.
3. Cream Latte product hero and infinite product rail.
4. Bestsellers.
5. Product/brand collage.
6. Resources carousel.
7. Company/manufacturing section.
8. Shared footer.

The hero is responsive composition, not a scaled mobile canvas. Stacked section
motion follows the hero and must fall back to ordinary visible document flow.

## Catalog

1. Shared header.
2. Local catalogue heading and four filters.
3. Four groups with 16 local product cards.
4. Hidden Tilda store data used only for product lookup/cart/popup integration.
5. Shared lead/cart records retained from the export.
6. Shared footer.

## Product template

Used by `/milkshake`, `/matcha`, `/chocolate`, `/iced-tea`, `/frappe`,
`/chai-latte`, `/cordial`, `/sugar-syrup`, `/jam`, `/raf-coffee`,
`/cream-latte`, `/tea`, `/topping`, `/garnish`, `/sugar-free`, and `/vending`.

1. Shared header.
2. Product hero: package/drink imagery, title, description, weight and pricing.
3. Cart/order actions and embedded product data.
4. Benefits, specifications, calculations, flavours and usage sections.
5. FAQ and sample/partner/private-label CTAs.
6. Shared footer.

All meaningful nodes are visible in the base render. Legacy animation classes
may not gate access to any of these sections.

## Company, resource and legal routes

- Company: `/about-us`, `/contacts`, `/distributors`, `/private-labeling`, `/rnd`.
- Resources: `/resources`, `/resources/blog`, `/resources/glossary`,
  `/resources/tools`, `/knowledge-recipes`, `/wholesale-strategy`.
- Legal: `/terms`, `/privacy`, `/sitemap`.

All use the canonical shared shell unless explicitly documented as a technical
legacy alias.
