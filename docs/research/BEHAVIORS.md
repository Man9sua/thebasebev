# Public UI behavior audit

Audit baseline: `https://the-base-staging.mansua.workers.dev`, with production
Tilda used read-only where the exported runtime was ambiguous. Browser evidence
is kept in the ignored `.audit-artifacts/` directory.

## Shared shell

- Every public marketing route renders the same React `SiteHeader` and
  `SiteFooter`. The two standalone Tilda header/footer aliases intentionally do
  not use the shell and are technical parity routes, not public navigation.
- Header interactions are keyboard-accessible: menu/search/region close on
  Escape, focus returns to the opener, and body scroll is restored on cleanup.
- The public account icon, Account group, Cabinet link, and `/cabinet` prefetch
  are migration leftovers. No commerce or lead flow depends on that page.
- `/cabinet` is an empty, non-indexable Tilda Members shell; the public behavior
  after this pass is a permanent redirect to `/`.

## Homepage

- The current design is a product-first React homepage, not the old five-slide
  Tilda carousel. The first viewport contains the Cream Latte copy and a
  continuously moving product-card rail; the remaining sections use stacked
  scroll transitions.
- The canonical content order is Hero, Bestsellers, manufacturing collage,
  Reading, About and Footer. Mobile restacks that content; desktop retains the
  wide three-column Bestsellers, twelve-column collage, two-column About and
  four-column footer instead of squeezing them into the mobile measure.
- The browser owns vertical document scrolling. Bestsellers has one active
  product state shared by arrows, dots, autoplay, keyboard, bidirectional
  pointer/touch swipes and dominant horizontal trackpad gestures.
- The 0-100 intro is shown once per tab. Progress is derived from fonts,
  document readiness and the first three hero images. It has a safety timeout,
  but no artificial minimum delay.
- Reduced-motion and no-JS users receive visible content immediately.
- Scroll reveal is progressive enhancement: server/default content is visible;
  JS may arm and animate an element only when the browser supports it.

## Catalog

- Four local category filters plus All render the 16 checked-in product cards.
- The friendly `/catalog` route no longer mounts Tilda Store, its async filter
  shim, or `.catg-*` hooks. This prevents legacy observers from mutating the
  native grid after a client navigation from an exported product page.
- Existing audited prices remain server-seeded. The native cart persists only
  product slug and quantity, and caps quantity at ten.
- Product framing is based on the meaningful opaque area of each source asset,
  not one uniform scale applied to every transparent canvas.
- An empty cart link returns to `/catalog`; a populated cart opens the dedicated
  `/checkout` review page. Stripe Test Mode remains the server-side payment POC.

## Product pages

- Sixteen friendly product routes share the exported Tilda product template.
- The local Tilda animation runtime currently leaves 35-40 meaningful hero,
  pricing and benefit elements at `opacity: 0`, even after a complete scroll.
  Production Tilda removes/completes those animation classes and shows them.
- Content must be visible without Tilda animation JavaScript. Animation may
  enhance entrance motion but must never decide whether the content exists.
- Tilda slider/zoom and lead popups remain intact. The removed global Tilda cart
  is replaced by the native catalogue/cart/checkout boundary.

## Contacts

- `/contacts` is native React rather than an exported absolute-positioned form.
- Its semantic controls remain usable without Tilda form JavaScript and submit
  through the shared `LeadAttributionBridge` to `/api/leads`.
- The form keeps the audited field contract and first-touch attribution while
  the page body follows the homepage's editorial light/dark visual system.

## Loading and images

- The route `loading.tsx` skeleton is reserved for client route transitions.
- Initial homepage reveal waits only for above-the-fold resources.
- Legacy documents promote only their first few local `data-original` images to
  eager server-rendered `src` values. Remaining images stay lazy.
- Images retain intrinsic layout or an explicit aspect ratio to avoid CLS.

## Responsive and accessibility contract

- Audit widths: 320, 360, 375, 390, 414, 430, 768, 1024, 1280, 1366, 1440,
  1536 and 1920 px.
- No document-level horizontal overflow, clipped public footer wordmark,
  overlapping header controls or animation-dependent invisible content.
- Focus indicators, semantic links/buttons, alt text, loader status, keyboard
  navigation and `prefers-reduced-motion` remain available.
