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
- Staging accepts Stripe Test Mode only. Card checkout remains closed until VAT
  is configured in Stripe and verified payment delivery to Odoo is implemented.
  The calculated order can be requested through `/api/leads`.
- `/api/stripe/webhook` verifies the Stripe signature but currently acknowledges
  events with `processed: false`. It does not yet create a Sales quotation.
- The existing enquiry pipeline is separate; do not repurpose or modify the live
  Tilda relay or existing Odoo lead automations for payment fulfillment.
- Read-only inspection on 2026-10-30 confirmed Odoo 19 Enterprise, access to Sales
  field metadata, draft defaults, an active AED currency, and separate product
  SKUs for full packs and samples. Creating a quotation has not been tested.
- Credentials stay server-side in ignored local files and Cloudflare secrets.

## Implementation sequence

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

A reviewed Odoo variant mapping, Stripe tax setup, and the durable payment-to-Sales
receiver are required before enabling a charge. Non-UAE/express delivery tariffs
and unmatched product prices remain unconfigured. The presence of valid API keys
alone does not make checkout ready to accept money.
