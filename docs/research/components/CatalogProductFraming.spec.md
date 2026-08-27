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
- The friendly catalogue does not mount hidden Tilda product data, store
  filters, cart markup or `.catg-*` observer hooks.
- Prices and quantities continue to be validated by the native server-owned
  commerce registry; CSS and image framing do not alter commerce data.
