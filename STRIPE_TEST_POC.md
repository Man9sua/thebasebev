# Stripe Test Mode proof of concept

Status: staging Test Mode E2E verified on 2026-08-26. The endpoint is now the
secure handoff for the native staging `/checkout` page; it remains isolated
from the removed Tilda cart, production order creation, Odoo, Telegram, Stripe
Live, and the production domain.

## Endpoints

- Checkout: `POST /api/checkout/stripe`
- Webhook: `POST /api/stripe/webhook`
- Staging webhook URL:
  `https://the-base-staging.mansua.workers.dev/api/stripe/webhook`

The checkout endpoint is guarded so it can run only on localhost or the exact
THE BASE staging hostname. It rejects live or unrecognized secret-key prefixes.
Success and cancel URLs are fixed server-side to the staging origin.
The native checkout can supply a validated contact email; Stripe collects the
billing address, a supported delivery country and payment authentication.

Example request shape:

```json
{
  "currency": "AED",
  "items": [
    {
      "productId": "389328196132",
      "quantity": 1
    }
  ]
}
```

Amounts, price IDs and totals are not accepted from the client. The immutable
server catalog is the price source. Products, integer quantities and AED are
validated before Stripe is called. Each session receives a random, non-PII
`tb_request_id` in Checkout Session and PaymentIntent metadata and as the
Stripe idempotency key.

Checkout bodies are limited to 16 KiB and guarded by a best-effort 10/minute
per-isolate IP limiter. Webhook bodies are limited to 1 MiB before signature
verification. Cloudflare WAF/rate-limit policy remains a human-controlled
production decision; this POC is not production payment architecture.

## Webhook status

The staging Test Mode webhook endpoint is enabled for
`checkout.session.completed`, and its signing secret is stored only in ignored
local environment configuration and as a Cloudflare staging Worker secret.
Signatures are verified against the exact raw request body. Unsigned and
invalid-signature requests return 400; correctly signed Test events return 200.

One server-priced AED 45.38 Checkout Session completed as paid in Test Mode.
Its real `checkout.session.completed` event was resent through the official
Stripe CLI and Cloudflare observed HTTP 200 on the exact staging URL. A second
resend of the same event also returned HTTP 200 without business side effects.
No full session, event, payment, or signing-secret identifiers are retained in
project documentation.

The proof of concept only acknowledges verified test events. It deliberately
does not create an order or trigger any external integration. A bounded
in-memory event ID registry demonstrates duplicate-delivery handling within a
single Worker isolate. This is not durable across isolates or deployments;
production payment processing must replace it with an atomic D1/KV-backed
event claim before adding side effects.

## Environment

Only variable names belong in Git:

```text
STRIPE_SECRET_KEY=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_WEBHOOK_SECRET=
```

Never commit actual values. Only Stripe Test Mode credentials are accepted by
this proof of concept.

`npm run verify:stripe-auth` performs a read-only SDK/API check and prints only
mode/status booleans. `npm run test:stripe` runs checkout, tampering,
quantity/currency, size, missing-env, host/Live-key, signature and duplicate
event tests without contacting Stripe.
