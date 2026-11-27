# Legacy product page specification

## Visible-content invariant

Every hero, title, tagline, description, weight, price, order CTA, benefit,
specification, calculation, flavour, usage, FAQ and lead CTA is visible in the
base render. `.t-animate` and `.t-animate_started` may not leave content at
`opacity: 0` or off-canvas.

## Retained runtime

- Product gallery, zoom/swipe, Tilda cart data and owned lead forms remain.
- Existing content, order, price and SEO metadata are not rewritten.
- Shared design tokens supply typography and shell colors without changing the
  page's audited layout.

## Critical images

Only the first few local export images are promoted from `data-original` to a
server-rendered `src`; the rest keep their legacy lazy behavior.
