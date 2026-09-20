# ToolsPage

## Purpose

Replace the fixed-height Tilda Zero Blocks on `/resources/tools` with a responsive THE BASE surface while preserving the existing calculator formula, RU/EN switch, all nine seasonal-menu products, generate/reset/print actions, and custom browser events.

## Structure

- Shared `SiteHeader` and `SiteFooter` remain unchanged.
- Light editorial hero with label, H1, concise B2B description, and two tool summaries.
- Cost calculator: input panel beside a compact results panel on wide screens; one column below 768 px.
- Seasonal Menu Builder: selectable product cards, prices, action row, generated printable menu.
- Existing legacy cart/forms/cookie runtime stays mounted after the React content, but the two old tool records are removed.

## Visual system

- Use `--tbb-*` tokens, Exo 2, black/white/grey palette, 1 px borders, restrained radii and uppercase labels.
- Controls have explicit hover and `:focus-visible` states.
- No fixed artboard height or absolutely positioned tool UI.
- At 375 px all controls are full-width where needed and no horizontal document overflow is allowed.

## Behaviour contract

- Cost: `unitCost / servings + milk + extras + packaging`.
- Margin: `salePrice - cost`; margin percent: `margin / salePrice * 100`.
- Invalid/non-finite inputs resolve safely to zero, matching the legacy script.
- RU/EN changes calculator labels and RUB/AED output only, matching the exported behavior.
- Menu builder preserves product names, default prices, selection, generation, reset and `window.print()`.
- Dispatch `tbCalcUpdated`, `tbMenuGenerated`, and `tbMenuReset` custom events.

