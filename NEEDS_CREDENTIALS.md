# Missing credentials and external confirmations

No real secret belongs in this repository. The following items are genuinely unavailable or unconfirmed.

## Lead delivery — NEEDS CREDENTIALS

- `LEAD_API_URL`
- `LEAD_API_KEY`
- confirmed lead recipients/routing by form and country
- owned receiver payload/response contract
- credentialed end-to-end success and failure test access

The typed `/api/leads` boundary and UTM/referrer payload are implemented. Without configuration it returns an honest `503 LEAD_BACKEND_NOT_CONFIGURED`; it never fakes delivery.

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

Cart/catalogue UI is verified, but no real order was submitted.

## Future Odoo integration — NEEDS CREDENTIALS LATER

- `ODOO_URL`
- `ODOO_API_KEY`
- model/field mapping and access policy

Odoo is not required for the current public-site cutover and must not be wired with guessed values.
