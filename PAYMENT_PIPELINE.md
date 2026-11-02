# Stripe payments → Odoo Sales

## Agreed behavior

After a successful website payment, create a **Quotation in Odoo Sales**
(`sale.order`, state `draft`) with a verified payment reference and paid amount.
Do not call `action_confirm`, create invoices, post accounting payments, or trigger
fulfillment automatically. A payment annotation is not a posted accounting entry.

Product orders contain every selected product/flavour and quantity. Sample
orders contain zero-priced sample lines. Delivery is a separate line. Full packs
and sample packs must use their respective Odoo product variants.
Samples use quantity controls like products; there is no six-flavour business
limit or one-sample-per-flavour rule. Preserve quantities in storage, requests and
Stripe line items. Both baskets share only the transport bounds in `shop-limits.ts`.

## Current verified state

- Native baskets and checkout exist at the established catalogue URLs.
- The owner supplied `BaseBev_Master_Price_List_to_01.09.2026 (1).xlsx` and
  confirmed 5% VAT is additional. 89 product/flavour/pack prices are mapped;
  43 site variants remain unresolved and use the quotation path. See `SHOP_PRICING.md`.
- UAE delivery is AED 30 before VAT, free for paid goods from AED 500 before VAT.
  Goods and free samples share one delivery. Sample-only parcels cost AED 30
  before VAT through 5 kg; unknown weights and heavier parcels require a quote.
- Weekday orders are delivered the next day; weekend orders in 1–2 days.
- Staging accepts Stripe Test Mode only. A manual exclusive 5% UAE VAT rate is
  configured. Goods and delivery use that rate; sample lines remain zero-priced.
- 88 paid variants and 52 sample variants map to distinct Odoo product records.
  The full Rainbow Unicorn pack has several Odoo recipes and requires a quote.
  Unmapped variants, unknown weights and unapproved delivery rates retain `/api/leads`.
- `/api/stripe/webhook` verifies the raw-body signature, retrieves the actual
  session, PaymentIntent, charge and complete line items, and matches them against
  the immutable D1 snapshot. Refunded/disputed payments and mismatched amounts,
  VAT, variants or quantities cannot create a quotation.
- The existing enquiry pipeline is separate; do not repurpose or modify the live
  Tilda relay or existing Odoo lead automations for payment fulfillment.
- Odoo 19 Enterprise uses the AED pricelist and existing exclusive 5% Dubai tax,
  rounding per line. The receiver action is installed without an automatic
  trigger. A dry run verified transaction locking and rejected an invalid SKU
  before any customer or quotation was created. Full payment verification is
  pending deployment of this implementation.
- Credentials stay server-side in ignored local files and Cloudflare secrets.

## Durable processing

1. Validate the customer, consent and selection. Calculate prices, VAT and delivery
   on the server. Store the immutable snapshot in `SHOP_ORDERS` before calling Stripe.
   A checkout idempotency key is tied to the full snapshot, including attribution.
2. Send the server-created lines to Stripe. Delivery is its own taxable line,
   ensuring Stripe and Odoo both use line rounding. A charged delivery consumes one
   of Stripe's 100 line slots; larger selections retain the quotation path.
3. A verified paid webhook reads Stripe independently. It never trusts a browser
   return, client amount or event body alone as proof of payment.
4. Odoo action `THE BASE Stripe Test — paid draft quotation` runs
   `integrations/odoo/stripe-test-quotation.py` as a single transaction. A PostgreSQL
   transaction advisory lock serializes the session reference. The existing draft
   is reused on retries; a fresh quotation, contacts and lines commit together only
   when Odoo's subtotal, VAT and total equal the verified charge.
5. Mark D1 fulfilled only after Odoo commits. Any failure returns HTTP 503 to Stripe
   and preserves the paid order for retry. Closing the browser does not affect
   processing. The return page only reads status and polls for the quotation.

The Odoo action only accepts Test Mode references and labels its quotations and
contacts `STRIPE TEST`. It does not call `action_confirm`, create invoices, post
payments or create stock transfers. Billing and delivery addresses remain separate.
`utm_source=chatgpt.com`, landing page, referrer, current page and customer notes
travel in the snapshot and an internal quotation annotation, without email fan-out.
They are not inserted into customer-facing terms. Receipts expose no customer details.

## Configuration

`wrangler.jsonc` binds only staging to `the-base-staging-orders`. Apply its
non-destructive schema with `wrangler d1 migrations apply the-base-staging-orders
--remote --env staging`. Keep `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`,
`STRIPE_UAE_VAT_RATE_ID`, `ODOO_URL`, `ODOO_API_KEY`, optional `ODOO_DATABASE` and
`SHOP_PAYMENTS_ENABLED=test` in ignored local files and staging secrets. A missing
binding, secret or receiver flag fails closed. Never configure Live keys in staging.

The enabled Stripe Test endpoint is `/api/stripe/webhook` on the authoritative
staging hostname and subscribes to `checkout.session.completed`. Card-only checkout
uses immediate payment; the handler also supports `checkout.session.async_payment_succeeded`.
After an Odoo outage, resend the successful Checkout event from Stripe's dashboard.
Retries must reuse the same session; never create a replacement paid session to
recover an already paid order. D1 stores the last retry-required state.

## Validation and rollout

1. **Approve the amounts and SKU mapping.** Receive the product/flavour prices,
   whether VAT is included, and delivery rates for products and samples by country
   and shipping method. Match each sellable line to its real Odoo `product.product`
   SKU. Do not choose ambiguous matches or reuse full-pack SKUs for samples.
2. **Prepare the order receiver.** Create an Odoo draft quotation from a validated
   paid order snapshot, including customer, billing/delivery addresses, product
   lines, a separate delivery line, currency, and Stripe identifiers. Verify Odoo
   totals equal the charged amount. Preserve the quotation's draft state.
3. **Connect verified Stripe events.** Handle successful Checkout payments on the
   server, retrieve the session and all line items from Stripe, and verify Test/Live
   mode, integration marker, payment status, currency, and server-approved totals.
   A browser return or a query parameter must never create the quotation.
4. **Prevent duplicate or lost orders.** Persist a unique Checkout Session
   reference in durable storage/Odoo. Concurrent events, retries and a Worker
   restart must resolve to the same quotation. A failed Odoo delivery must remain
   retryable and must not be acknowledged as successfully processed.
5. **Test the complete flow.** Use approved amounts in Stripe Test Mode. Confirm
   that one successful payment creates one clearly marked test quotation. Repeat
   the event, close the browser before return, cancel a checkout, and simulate
   Odoo failure. Verify amounts, separate sample/delivery lines, draft state, and
   absence of invoices or automatic order confirmation.
6. **Enable Live separately.** Configure and verify the Live provider and webhook
   only during a separately approved production rollout. Staging stays Test Mode;
   production DNS, Tilda and the custom domain remain unchanged during preparation.

## Data still required

Non-UAE/express delivery tariffs and unmatched product prices remain unconfigured.
Live rollout requires separate approval, Live credentials/provider configuration,
a Live receiver and end-to-end verification. Production DNS, Tilda, the production
domain and existing lead automations remain outside this staging implementation.
