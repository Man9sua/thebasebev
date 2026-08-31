# THE BASE commerce production readiness

Last audited: 2026-08-31. This document describes the Test Mode/staging
architecture. It does not authorize Stripe Live, Odoo commercial writes, a
production deploy, DNS changes, or a Tilda cutover.

## Status matrix

| Area | Status | Evidence / blocker |
| --- | --- | --- |
| CATALOG | PASS | 16 public products; 13 fixed-price Stripe products; Tea, Topping and Vending remain request-only. |
| CART | PASS | Versioned `thebase:cart:v2` schema, malformed-data fallback, quantity/remove, empty-cart redirect. |
| SERVER PRICING | PASS | Checkout accepts product IDs and quantities only; AED amounts come from the immutable server catalogue. |
| STRIPE TEST CHECKOUT | PASS | Test-key and staging-host guards, server-created Checkout Session, verified return URL. |
| WEBHOOK SIGNATURE | PASS | Exact raw body is verified; missing/invalid signatures return HTTP 400; Live events are rejected. |
| PERSISTENT IDEMPOTENCY | PASS | D1 uniqueness on Stripe event and Checkout Session plus an atomic fulfillment claim. |
| D1 ORDER STORAGE | PASS | Migration `0001_commerce_fulfillment.sql` applied to `the-base-commerce-staging`; orders, items and webhook attempts are durable. |
| ODOO CONNECTION | BLOCKED | Odoo 19.0+e JSON-2 passed read-only auth. A dedicated least-privilege staging write credential is not configured. |
| ODOO CUSTOMER SYNC | BLOCKED | Email/phone dedupe and delivery-contact logic pass automated tests; no production Odoo write was attempted. |
| ODOO PRODUCT MAPPING | BLOCKED | All 13 purchasable website products are `UNMAPPED`; name searches return ambiguous variants and Jam has no exact candidate. |
| ODOO SALES ORDER | BLOCKED | Creation, Stripe reference, total comparison and `action_confirm` pass mocked JSON-2 tests; live write test is intentionally blocked. |
| ODOO DUPLICATE PROTECTION | PASS | D1 session uniqueness plus Odoo `client_order_ref` lookup; duplicate/recovery tests pass. |
| THANK-YOU VERIFICATION | PASS | `/api/checkout/session/:session_id` retrieves Stripe server-side and exposes only a safe status projection. |
| CART CLEAR | PASS | Cart clears only after a server-retrieved paid Test session validates against its D1 snapshot. |
| MANAGER NOTIFICATION | NOT CONFIGURED | Telegram provider is isolated and retryable; staging destination/secrets and PII policy are not confirmed. |
| SHIPPING | BLOCKED | Server configuration exists but no business rates/zones/free-shipping threshold were supplied; disabled by default. |
| TAX | BLOCKED | Stripe Automatic Tax support is gated and disabled; authoritative VAT/tax treatment is not approved. |
| PROMO CODES | OPTIONAL | Stripe promotion-code support is gated and disabled; Odoo discount parity must be configured before enablement. |
| INVENTORY | BLOCKED | Odoo Inventory is installed, but Odoo has not been approved as the website stock authority. No false availability check is enforced. |
| INVOICE | NOT CONFIGURED | Accounting and Odoo Stripe provider are installed. Invoice policy and external-payment reconciliation are unconfirmed; no fake accounting records are created. |
| SECURITY | PASS | Server-only secrets, SQL binding, raw signature verification, sanitized responses, Test-host/Test-key guards and no card-data handling. |
| E2E | BLOCKED | Stripe-to-D1 staging E2E can be rerun after deploy; full Odoo/notification E2E requires the blockers above. |
| FAILURE RECOVERY | PASS | Paid order persists on Odoo failure and safely resumes without a second order in automated tests. |

Production readiness is **BLOCKED** while any required row above is blocked.

## Persistent flow

```text
catalog/cart
  -> POST /api/checkout/stripe
  -> D1 checkout snapshot
  -> Stripe Test Checkout
  -> signed webhook
  -> D1 event/session claim
  -> server-side Stripe Session + line_items validation
  -> Odoo customer and Sales Order (only when explicitly configured)
  -> manager notification
  -> verified /checkout/success status
```

The browser success page never creates an Odoo order. Webhook processing is
the only fulfillment entry point.

## Product mapping gate

Run `npm run audit:odoo-mapping`. Every row must be `PASS` before enabling
`ODOO_COMMERCE_ENABLED`. Mapping by display name alone is prohibited.

| Website product | Website SKU | Odoo mapping |
| --- | --- | --- |
| Sugar Free | `web:194500823312` | UNMAPPED |
| Frappe | `web:207187094752` | UNMAPPED |
| Iced Tea | `web:293702296702` | UNMAPPED |
| Chocolate | `web:296069682122` | UNMAPPED |
| Garnish | `web:316933484392` | UNMAPPED |
| Jam | `web:324849428612` | UNMAPPED |
| Milkshake | `web:389328196132` | UNMAPPED |
| Raf Coffee | `web:466013811412` | UNMAPPED |
| Cordial | `web:778280145182` | UNMAPPED |
| Cream Latte | `web:781170478702` | UNMAPPED |
| Chai Latte | `web:827401503212` | UNMAPPED |
| Sugar Syrup | `web:888812727292` | UNMAPPED |
| Matcha | `web:975474893862` | UNMAPPED |

## Owner prerequisites before Stripe Live

1. Approve exact Odoo `product.product` IDs and `default_code` values for all 13 rows.
2. Create a dedicated least-privilege non-production Odoo JSON-2 API key with the required partner/sales permissions.
3. Supply and approve shipping zones/rates and source of truth for tax.
4. Decide whether Odoo Inventory is authoritative and define oversell handling.
5. Approve invoice/payment-provider reconciliation; do not synthesize a paid invoice or `payment.transaction`.
6. Approve the manager-notification destination and PII policy.
7. Complete a staging Test Mode E2E, webhook resend and forced-Odoo-failure recovery test.
8. Perform a separate security/accounting review and human-controlled Live cutover. Never reuse Test secrets as Live credentials.
