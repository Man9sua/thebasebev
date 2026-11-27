# NativeCheckout specification

## Overview

- Target: `src/components/checkout/CheckoutPage.tsx`
- Route: `/checkout`, noindex and excluded from sitemap.
- Visual reference: user-provided Avantcha checkout screenshot. Automated access reached a Cloudflare challenge, so the screenshot, not guessed live CSS, is the visual source.
- Interaction model: cart review and quantity editing, then server-created Stripe Checkout Session.

## Structure

1. Minimal checkout header with THE BASE mark and a return-to-catalog control.
2. Two-column desktop body.
3. Left: contact email, delivery/payment explanation and primary continuation action.
4. Right: sticky order summary, product rows, quantity controls, subtotal and total.
5. Mobile stacks summary before contact/action.

## Business contract

- Empty cart redirects to `/catalog`; no empty cart modal exists.
- Client stores only `{ slug, quantity }`.
- Display totals are derived from the checked-in AED product registry.
- POST `/api/checkout/stripe` sends only server-recognised product IDs, integer quantities, `aed` and an optional validated email.
- Server remains the price source of truth and rejects client price fields.
- Stripe Test Mode owns card entry, billing/delivery collection and payment authentication.
- No Odoo write, production order creation or Live Stripe resource is introduced.

## States

- Hydrating: quiet branded status, no empty-cart flash.
- Empty: immediate `router.replace('/catalog')`.
- Ready: editable quantities and order total.
- Submitting: controls disabled and button announces secure redirect.
- Error: inline live-region error; cart remains editable.

## Responsive behavior

- Desktop: approximately 55/45 split, summary on pale grey surface.
- Mobile: single column; order summary first; controls keep 44 px targets.
