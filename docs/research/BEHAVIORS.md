# Behavior audit

## Responsive reference

Reference captures are stored in `docs/design-references/` for 1440×1000, 768×1000, and 390×844. The local export and production screenshots have identical SHA-256 hashes at all three viewports.

## Header

- The header remains fixed above page content.
- Desktop Catalog opens a four-column mega-menu on hover; the chevron rotates 180 degrees over 0.2 s.
- Desktop link underlines animate with a 0.22 s transform.
- Country selector is click-driven, contains a search input, and closes on outside click/Escape.
- Search is click-driven, filters known site destinations, accepts Enter, and closes on Escape.
- Burger navigation appears below 1100 px and is click-driven.
- Cart badge is synchronized periodically with the Tilda cart state.
- The source contains a 22 s ticker-marquee implementation, but the final production CSS hides the ticker. It must not become visible during parity migration.

## Homepage hero

- Five slides.
- Autoplay delay: 6500 ms.
- Controls: previous/next arrows, dot buttons, keyboard, and touch swipe.
- Autoplay pauses on mouseenter, focusin, or pointerdown.
- Slide content uses opacity/visibility and transforms; text lifts from 14 px with a 0.6 s transition.
- Reduced-motion removes slide, lift, arrow, and dot transitions.
- Desktop is a two-column image/text composition. Tablet and mobile stack image above centered copy.

## Catalog

- Four click filters plus All; filtered groups/cards are shown/hidden without navigation.
- Card images scale on hover; cards reveal as they enter the viewport.
- Product-card copy is patched from a local 16-item description registry.
- Add to cart uses a 13-item product/price registry and the Tilda cart/product-popup flow.
- Existing custom code caps total cart quantity at 10 and disables plus/buy controls at the limit.

## Product and content pages

- Product pages use Tilda slider/zoom/swipe modules for imagery.
- Repeated section reveal behavior uses `IntersectionObserver` where supported and immediate visibility when reduced motion is requested.
- Popup CTAs (`#partner`, `#custom`, `#sample`, `#brand-flavor`) open full responsive zero-block forms.
- Escape closes custom popups/menus.

## Forms

- Required fields: full name, email, phone, and consent for the four shared lead variants.
- Existing UI displays required/email/name/phone/minlength errors.
- Successful shared lead submission redirects to `/thank-you-form`.
- The Next.js integration must additionally attach landing page, referrer, form name, country, and all five UTM values, including `utm_source=chatgpt.com`.

## Cookies and analytics

- Cookie banner appears before consent and exposes Accept All and Cookie Settings.
- Analytics/advertising categories are configurable.
- The original includes two GTM containers plus direct GA4. Migration must avoid accidental duplicate initialization while preserving existing destinations.

## Known original behavior to preserve during parity

- At 390 px the hero and cookie banner currently clip some content at the inline end. This is an original production behavior visible in the reference screenshot and is not silently redesigned during clone-stage.
- Static canonical URLs omit the trailing slash, while a shared client script currently changes them after load. The server-rendered Next metadata will follow the canonical values from the static export; the conflict is recorded in migration notes.
