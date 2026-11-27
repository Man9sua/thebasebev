# Product Pages — Figma mapping

Source file: `OgAPMQxQyOXbkJlR5PsSNs` (`productpages`), page node `0:1`.

Inventory method: Figma MCP metadata was read for the complete page and `get_design_context` was read for every listed desktop and mobile frame before implementation. The three unnamed `Product_Card` frames are non-route working copies and are not mapped as products.

| PRODUCT | ROUTE | DESKTOP FIGMA NODE | MOBILE FIGMA NODE | THEME | ASSET STATUS | IMPLEMENTATION STATUS |
|---|---|---:|---:|---|---|---|
| Raf Coffee | `/raf-coffee` | `3:13661` | `3:20095` | warm sand, `#bbaf97`; mobile panel `#ddd1b9` | exact pack/glass/scene WebP present | implemented; local QA PASS |
| Cream Latte | `/cream-latte` | `3:14537` | `3:20243` | blush, `#d1adaa`; mobile panel `#f4e3e1` | exact pack/glass/scene WebP present | implemented; local QA PASS |
| Chai Latte | `/chai-latte` | `3:15488` | `3:20610` | spiced beige, `#c2a899`; mobile panel `#f4ebe6` | exact pack/glass/scene WebP present | implemented; local QA PASS |
| Milkshake | `/milkshake` | `3:15773` | `3:20956` | rose, `#dfa8b5`; mobile panel `#f3dee3` | exact pack/glass/scene WebP present | implemented; local QA PASS |
| Frappe | `/frappe` | `3:16154` | `3:21297` | coffee, `#996539`; mobile panel `#d2b398` | exact pack/glass/scene WebP present | implemented; local QA PASS |
| Iced Tea | `/iced-tea` | `3:16593` | `3:21640` | golden tea, `#d6ba61`; mobile panel `#f9e7ac` | exact pack/glass/scene WebP present | implemented; local QA PASS |
| Cordial | `/cordial` | `3:16898` | `3:21955` | blue, `#8398b2`; mobile panel `#d0ddef` | exact pack/glass/scene WebP present | implemented; local QA PASS |
| Topping | `/topping` | `3:17231` | `3:22271` | warm ivory, `#d5d1c1`; mobile panel `#ece9dd` | exact pack/glass/scene WebP present | implemented; local QA PASS |
| Matcha | `/matcha` | `3:17594` | `3:22596` | matcha green, `#52a866`; mobile panel `#aae2b7` | exact pack/glass/scene WebP present | implemented; local QA PASS |
| Chocolate | `/chocolate` | `3:17930` | `3:22915` | cocoa, `#4a322d`; mobile panel `#8c706a` | exact pack/glass/scene WebP present | implemented; local QA PASS |
| Sugar Syrup | `/sugar-syrup` | `3:18262` | `3:23228` | peach, `#e6b3a8`; mobile panel `#f9d9d1` | exact pack/glass/scene WebP present | implemented; local QA PASS |
| Sugar Free | `/sugar-free` | `3:18651` | `3:24867` | pale green, `#e8f2e9` / `#acc4b2`; mobile panel `#e0e9e2` | exact multi-layer scene WebP present | implemented; local QA PASS |
| Tea | `/tea` | `3:19064` | `3:24557` | black hero; mobile panel `#5e5a57` | exact multi-layer scene WebP present | implemented; local QA PASS |
| Garnish | `/garnish` | `3:19330` | `3:24233` | sand, `#ceb999`; mobile panel `#dfceb4` | exact pack/scene WebP present | implemented; local QA PASS |
| Vending | `/vending` | `3:19563` | `3:23557` | dark brown, `#4f352f` / `#8c735e`; mobile panel `#c9b7a2` | exact pack/glass/scene WebP present | implemented; local QA PASS |
| Jam | `/jam` | `3:19887` | `3:23897` | berry, `#3e070b` / `#82282f`; mobile panel `#fccace` | exact pack/glass/scene WebP present | implemented; local QA PASS |

## Inventory result

- Desktop product frames: **16**.
- Mobile product frames: **16** (all designed at 360 px).
- Canonical product routes in `src/data/products.ts`: **16**.
- Mapped routes: **16**.
- Unmapped Figma product frames: **0**.
- Unmapped product routes: **0**.
- Ambiguous mappings: **0**.
- Non-route Figma working copies: `3:14154`, `3:14924`, `3:15206` (`Product_Card`).

## Shared Figma body structure

1. Product hero with product-specific composition, descriptor, copy, profitability card, certification marks and two real CTAs.
2. Four product benefits.
3. Four operating figures (preparation time, packaging, proportions/yield and serving size/cost).
4. Comparative calculation table.
5. Flavours plus custom-flavour CTA.
6. Usage instructions and diagram.
7. Partner enquiry CTA/form.
8. Existing route-specific FAQ, added immediately before the shared footer because the Figma frames do not contain the production FAQ.

The Figma header/footer layers are reference-only for these pages. The implementation keeps the site's existing shared `SiteHeader` and `SiteFooter` unchanged.
