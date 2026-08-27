# NativeCatalog specification

## Overview

- Target: `src/components/catalog/CatalogPage.tsx`
- Source of truth: the supplied correct `/catalog` screenshot at 1919 x 1199.
- Interaction model: client-side category filtering and add-to-cart actions over server-rendered product data.

## Root cause being removed

The legacy catalogue is not deterministic. Four exported category groups, Tilda Store startup, an injected filter shim and high-specificity CSS all compete to decide whether the grid is visible. Before the legacy runtime finishes, the first group can be painted as a single centred card. The native catalogue must render all sixteen cards in its initial HTML and must not wait for Tilda JavaScript.

## Structure

1. Shared fixed header.
2. Editorial page head: `CATALOGUE`, preserved H1 and preserved lede.
3. Five filter controls: All plus four product categories.
4. Responsive product grid.
5. Shared footer.

## Visual contract

- Paper background, black display heading, muted uppercase labels.
- Desktop content width follows `--tbb-max`, with `--tbb-gutter` page inset.
- Desktop grid: 3 columns; tablet: 2; small mobile: 1.
- Card image is square, full bleed and reserves its size before loading.
- Name and price share one row on desktop; description, category and understated action follow.
- Tea uses a controlled image scale of `1.08` with hidden overflow so the pack reads at the same visual weight as the reference card.

## States and behavior

- The initial `All` state contains exactly 16 cards in the DOM and visible grid.
- Filters update immediately without network or legacy script dependencies.
- Priced products expose `Add to cart`; request-only products link to `/contacts`.
- Add actions store only product slug and quantity. Names and AED prices are always re-derived from the product registry.
- Hover may scale the image slightly, but must not tilt the document or cause reflow.

## Responsive behavior

- 1440 px: 3 equal columns, 24 px nominal gap.
- 768 px: 2 columns.
- 390 px: 1 column with full-width tiles and no horizontal overflow.
