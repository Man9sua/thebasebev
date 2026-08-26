# Catalog product framing specification

## Visual contract

- Product photography dominates each card while keeping the complete product
  object visible.
- A common adjusted-image scale handles ordinary transparent WebP canvases.
- Only assets with measured exceptional transparent bounds receive a named,
  route-scoped override.
- Hover never clips the meaningful opaque bounds and does not cause reflow.

## Runtime contract

- Local filters and all 16 card links remain functional.
- Hidden Tilda product data remains available to cart/product-popup code.
- Hidden Tilda store filters stay disabled because the local UI replaces them.
- Prices and quantities continue to be validated by the existing commerce
  layer; CSS and image framing do not alter commerce data.
