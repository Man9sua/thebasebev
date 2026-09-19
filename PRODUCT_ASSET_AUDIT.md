# Product Pages — asset audit

Repository media inventory before the rebuild: **714 files** — 286 WebP, 210 PNG, 158 SVG and 60 JPG. Product implementation uses separate image/vector layers only; no complete Figma frame or section export is used.

The concise `pack-*`, `glass-*`, `shot-*`, `scene-*`, `seal-*` and `mark-*` files are existing Figma/Tilda-origin exports prepared as delivery-sized WebP/SVG assets. They take precedence over the duplicate raw PNG/JPG export files still retained under `public/images`.

| PRODUCT | ROUTE | FIGMA IMAGE ROLE | LOCAL ASSET | FORMAT | MATCH CONFIDENCE | USED |
|---|---|---|---|---|---|---|
| Raf Coffee | `/raf-coffee` | pack, drink, hero/usage imagery | `/images/pack-raf-coffee.webp`, `/images/glass-raf-coffee.webp`, `/images/shot-raf-coffee.webp` | WebP | high — exact source-layer exports | yes |
| Cream Latte | `/cream-latte` | pack, drink, hero/usage imagery | `/images/pack-cream-latte.webp`, `/images/glass-cream-latte.webp`, `/images/shot-cream-latte.webp` | WebP | high — exact source-layer exports | yes |
| Chai Latte | `/chai-latte` | pack, drink, hero/usage imagery | `/images/pack-chai-latte.webp`, `/images/glass-chai-latte.webp`, `/images/shot-chai-latte.webp` | WebP | high — exact source-layer exports | yes |
| Milkshake | `/milkshake` | pack, drink, hero/usage imagery | `/images/pack-milkshake.webp`, `/images/glass-milkshake.webp`, `/images/shot-milkshake.webp` | WebP | high — exact source-layer exports | yes |
| Frappe | `/frappe` | pack, drink, hero/usage imagery | `/images/pack-frappe.webp`, `/images/glass-frappe.webp`, `/images/shot-frappe.webp` | WebP | high — exact source-layer exports | yes |
| Iced Tea | `/iced-tea` | pack, drink, hero/usage imagery | `/images/pack-iced-tea.webp`, `/images/glass-iced-tea.webp`, `/images/shot-iced-tea.webp` | WebP | high — exact source-layer exports | yes |
| Cordial | `/cordial` | pack, drink, hero/usage imagery | `/images/pack-cordial.webp`, `/images/glass-cordial.webp`, `/images/shot-cordial.webp` | WebP | high — exact source-layer exports | yes |
| Topping | `/topping` | pack, drink, hero/usage imagery | `/images/pack-topping.webp`, `/images/glass-topping.webp`, `/images/shot-topping.webp` | WebP | high — exact source-layer exports | yes |
| Matcha | `/matcha` | pack, drink, hero/usage imagery | `/images/pack-matcha.webp`, `/images/glass-matcha.webp`, `/images/shot-matcha.webp` | WebP | high — exact source-layer exports | yes |
| Chocolate | `/chocolate` | pack, drink, hero/usage imagery | `/images/pack-chocolate.webp`, `/images/glass-chocolate.webp`, `/images/shot-chocolate.webp` | WebP | high — exact source-layer exports | yes |
| Sugar Syrup | `/sugar-syrup` | pack, drink, hero/usage imagery | `/images/pack-sugar-syrup.webp`, `/images/glass-sugar-syrup.webp`, `/images/shot-sugar-syrup.webp` | WebP | high — exact source-layer exports | yes |
| Vending | `/vending` | pack, drink, hero/usage imagery | `/images/pack-vending.webp`, `/images/glass-vending.webp`, `/images/shot-vending.webp` | WebP | high — exact source-layer exports | yes |
| Jam | `/jam` | pack, drink, hero/usage imagery | `/images/pack-jam.webp`, `/images/glass-jam.webp`, `/images/shot-jam.webp` | WebP | high — exact source-layer exports | yes |
| Garnish | `/garnish` | product cut-out/collage and usage imagery | `/images/pack-garnish.webp`, `/images/scene-a8524cbfc3419x1973.webp`, `/images/shot-garnish.webp` | WebP | high — exact source-layer exports | yes |
| Sugar Free | `/sugar-free` | sachet/leaf/drink collage and usage imagery | `/images/scene-f16e70efc*.webp`, `/images/scene-5f33d9e4f813.webp`, `/images/scene-cdd1d94df813.webp`, `/images/scene-3c519f85f813.webp`, `/images/scene-0a906e54c0x3180.webp`, `/images/shot-sugar-free.webp` | WebP | high — exact individual Figma image layers | yes |
| Tea | `/tea` | tea photo/leaves collage and usage imagery | `/images/scene-e84aac77f*.webp`, `/images/scene-720e38e5f813*.webp`, `/images/scene-1eec80f6f781*.webp`, `/images/scene-37eb1716f813.webp`, `/images/shot-tea.webp` | WebP | high — exact individual Figma image layers | yes |
| Shared | all product routes | certification marks and background wordmark | `/images/seal-haccp.webp`, `/images/seal-halal.webp`, `/images/mark-the.svg`, `/images/mark-word.svg`, `/images/mark-phone.svg` | WebP/SVG | high — exact source-layer exports | yes |

## Missing and ambiguous assets

- Missing product visuals: **0**.
- Generic placeholders used: **0**.
- AI-generated replacements used: **0**.
- Flattened frame/section screenshots used: **0**.
- Ambiguous product-image mappings: **0**.

Large raw export duplicates remain untouched. Their shared and dynamic legacy references remain UNKNOWN, so they are not safe to delete merely because the delivery-sized WebP variants are used.
