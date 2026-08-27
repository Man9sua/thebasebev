# Missing credentials and external confirmations

No real secret belongs in this repository. The following items are genuinely unavailable or unconfirmed.

## GitHub Cloudflare deployment — NEEDS CREDENTIALS

- target-account-scoped `CLOUDFLARE_API_TOKEN` for GitHub environments `staging` and `production`
- `CLOUDFLARE_ACCOUNT_ID` GitHub environment variable confirming the isolated `mansua` account
- optional human approval/reviewer rules for the `production` GitHub environment

The manual workflow refuses any account ID other than the pinned THE BASE target. Do not reuse a personal `indukok667` credential. Local Wrangler OAuth credentials are user-level only and were not copied into GitHub or Git.

## Lead delivery — STAGING READY / PRODUCTION NEEDS APPROVAL

- production `LEAD_API_URL` Cloudflare secret at the future approved release
- `LEAD_API_KEY` only if the current upstream is upgraded to require authentication
- confirmed lead recipients/routing by form and country
- owned receiver payload/response contract
- production cutover approval

The staging Worker has `LEAD_API_URL` configured as a secret. Exactly one
controlled, labelled lead passed through the current Next.js code on 2026-08-24
and was confirmed read-only in Odoo, including first-touch
`utm_source=chatgpt.com` and request ID. The current upstream accepts requests
without `LEAD_API_KEY`; no value was invented. Production remains a separate
human-approved environment.

## Telegram notifications — NEEDS CREDENTIALS AND DECISION

- `TELEGRAM_BOT_TOKEN`
- `TELEGRAM_CHAT_ID`
- optional `TELEGRAM_MESSAGE_THREAD_ID`
- confirmation that Telegram fan-out is still required and its PII policy

No Telegram credential was present, so no message was sent and no unverified
notification path was implemented.

## Stripe Test webhook — VERIFIED

The Test Mode endpoint and signing secret are configured for staging. One paid
AED Checkout, a real `checkout.session.completed` delivery, and a duplicate
resend returned HTTP 200. Stripe Live was not accessed or modified. No Stripe
credential is needed for the completed staging POC; any production payment
contract remains explicitly out of scope.

## Analytics — NEEDS CONFIRMATION

The Tilda export contains overlapping identifiers:

- GA4 candidate `G-89J9ZDN1B1`
- legacy Google tag `G-VKXMKBRV73`
- GTM candidate `GTM-P99PF655`
- Tilda-managed GTM candidate `GTM-WPRV8CZ2`
- AdSense publisher `ca-pub-9584440435840838`

Confirm the owned active GTM container, whether it already emits GA4 `page_view`, the authoritative GA4 measurement ID, consent requirements, and whether AdSense should remain. Do not enable the full list. The code gives GTM precedence and uses direct GA only when no GTM ID is configured.

## Orders/payments — NEEDS CONTRACT

- owned order receiver and payload contract
- payment provider/account contract, if online payment is intended
- fulfilment/notification recipients
- credentialed checkout/order error and success tests

Native cart/catalogue/checkout UI is verified in Test Mode, but no production
order was submitted and no Live payment contract exists.

## Future direct Odoo integration — NEEDS CREDENTIALS LATER

- `ODOO_URL`
- `ODOO_API_KEY`
- model/field mapping and access policy

The current migration preserves the existing Tilda-compatible webhook contract.
A future direct API must use a dedicated least-privilege integration credential;
the read-only audit credential must not be repurposed automatically.
