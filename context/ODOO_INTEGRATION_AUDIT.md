# Odoo integration audit

Read-only production audit performed on 2026-08-24 against `odoo.thebasebev.com`. The audit used Odoo JSON-2 with the API key stored only in ignored `.env.local`.

## Safety boundary

Only these methods were available to the audit scripts:

```text
context_get
fields_get
read
search
search_count
search_read
```

No `create`, `write`, `unlink`, confirmation action, invoice/order/lead creation, payment operation, provider change, webhook change, or automation change was attempted. Raw PII, payment references, automation code, API keys, webhook UUIDs, and complete webhook URLs were not persisted.

## API status

| Check | Result | Evidence |
| --- | --- | --- |
| Odoo version | PASS | `19.0+e` from `/web/version` |
| JSON-2 | PASS | authenticated `POST /json/2/res.users/context_get` |
| Authentication | PASS | current-user context returned `uid`, language, and timezone |
| Database header | NOT REQUIRED | authentication and every model query succeeded without `X-Odoo-Database` |
| Effective read access | PASS for audited models | `fields_get` and `search_count` succeeded on every required model |

Odoo JSON-2 runs requests with the access rights, record rules, and field access of the API-key user. See the [official Odoo JSON-2 documentation](https://www.odoo.com/documentation/19.0/developer/reference/external_api.html).

## Model inventory

| Model | Read | Visible records at audit time |
| --- | --- | ---: |
| `crm.lead` | PASS | 306 |
| `sale.order` | PASS | 458 |
| `sale.order.line` | PASS | 3,211 |
| `res.partner` | PASS | 702 |
| `product.template` | PASS | 1,414 |
| `product.product` | PASS | 1,416 |
| `payment.provider` | PASS | 25 |
| `payment.transaction` | PASS | 0 |
| `account.move` | PASS | 10,738 |
| `utm.source` | PASS | 24 |
| `utm.medium` | PASS | 16 |
| `utm.campaign` | PASS | 1 |
| `base.automation` | PASS | 10 |
| `ir.actions.server` | PASS | 297 |

`ir.model` metadata discovery found `base.automation` as the installed automation model. No separate Tilda-specific or webhook-log model was exposed by model metadata.

## CRM flow

All 306 accessible leads/opportunities were inspected only for non-PII signals. No names, email addresses, phone numbers, or raw descriptions were saved.

Verified attribution/form evidence:

- 96 records contain a Tilda signal in the audited naming, description, website, or attribution fields.
- 41 contain a `Free Sample` signal.
- 36 contain a `Partner with Us` signal.
- 66 contain `thebasebev.com`; 63 contain a website signal.
- In the newest 100 records, 43 have the exact `utm.source` display value `Tilda`; 10 have medium `Website`.
- Four records contain the literal `utm_source` in the audited fields.
- No `chatgpt.com` value was found in the audited attribution/text fields across all 306 records. This is evidence for the accessible dataset, not proof that such referrals never existed elsewhere.

Relevant standard fields are `source_id`, `medium_id`, `campaign_id`, `tag_ids`, `website`, `description`, `email_from`, `phone`, `contact_name`, and `partner_name`. No dedicated form-name, landing-page, referrer, or full UTM custom fields were discovered. Existing custom CRM fields relate mainly to country and R&D workflows rather than web attribution.

Current attribution therefore does not preserve the complete Next.js payload requirement (`landing_page`, `referrer`, and all five UTM values) as first-class CRM fields. In particular, preservation of first-touch `utm_source=chatgpt.com` is not verified.

## Tilda webhook flow

Odoo-side processing is verified:

```text
POST /web/hook/[REDACTED]
        ↓
active base.automation: Tilda → CRM lead (webhook)
trigger: on_webhook
        ↓
ir.actions.server: Create lead from Tilda payload
        ↓
crm.lead.create(...)
```

The automation is active, has one server action, has webhook-call logging enabled, and has a configured webhook route. `last_run` is not populated, so execution timing cannot be inferred from that field.

The readable server action creates a new `crm.lead`; it does not update an existing record. It maps these fields:

```text
name
contact_name
partner_name
email_from
phone
description
source_id
team_id
type
```

The action recognizes common Tilda payload aliases including `NAME`/`Name`, `EMAIL`/`Email`, and `PHONE`/`Phone`/`phone_number`. Full code and constants were deliberately not copied into this report.

What is not verifiable through Odoo API:

- which external caller currently invokes the webhook;
- whether the hop is specifically a Cloudflare Worker named `tilda-odoo`;
- retry, rate-limit, signature, idempotency, and dead-letter behavior before Odoo;
- the full webhook token/URL, intentionally redacted;
- raw webhook logs or historical payloads.

Therefore:

```text
Tilda form → Odoo webhook → crm.lead: VERIFIED
Tilda → Cloudflare tilda-odoo Worker: UNKNOWN FROM ODOO API
Cloudflare tilda-odoo Worker → Odoo: PARTIAL, Odoo receiver verified only
```

## Sales flow

The newest 100 of 458 accessible sales orders and their 410 recent lines were aggregated without customer data.

- Lifecycle: 63 `sale`, 24 `draft`, 13 `cancel`.
- Currency: 60 AED orders and 40 USD orders.
- Invoice linkage: 49 orders have invoice relations.
- Invoice status: 35 invoiced, 20 to invoice, 45 not requiring/without invoice.
- Payment transaction linkage: 0 orders.
- Website/UTM/source evidence: 0 orders in the audited sample.
- Tax linkage: 356 lines have taxes; 54 do not.
- Delivery: two recent orders reference `Standard delivery`; no broader website-delivery conclusion is supported.

The line model contains product, quantity, unit price, discount, taxes, subtotal, and total fields. Sales orders contain customer, currency, totals, delivery, stock picking, invoice, payment transaction, source, medium, and campaign relations.

No evidence links the audited sales orders specifically to Tilda or the website.

## Invoice/accounting flow

`account.move` is readable. Of the newest 100 moves:

- 95 are posted and five are draft;
- 11 are customer invoices, 10 vendor bills, 11 purchase receipts, and 68 journal entries;
- payment states are 76 not paid, 13 in payment, 10 paid, and one partial.

Sales-to-invoice linkage exists, but it does not establish a Stripe relationship because the entire `payment.transaction` model has zero records.

## Stripe and payment flow

The Stripe provider is present and safely verified as:

- code `stripe`;
- state `enabled`;
- published;
- company `The Base Beverage LLC`;
- journal `RAK Bank`;
- tokenization and express checkout supported;
- manual capture capability `full_only`;
- no configured country or currency restriction lists;
- linked active methods: Card, Bancontact, EPS, P24, and iDEAL.

Cash on Delivery is also enabled and published. No provider secret, API key, signing secret, token, or publishable key was read or recorded.

However:

```text
payment.transaction total records: 0
Stripe payment.transaction records: 0
recent sale.order → payment.transaction links: 0
```

This proves provider configuration, not provider execution. There is no Odoo evidence of completed, pending, failed, refunded, or authorized Stripe transactions.

## Current verified architecture

```text
Lead path, Odoo side:
Tilda-shaped payload
→ native Odoo webhook automation
→ server action
→ crm.lead

Commercial records:
sale.order
→ sale.order.line
→ account.move/invoice where applicable

Payment configuration only:
payment.provider (Stripe enabled)
⇢ no payment.transaction records
```

## Leads recommendation

For initial migration, keep the existing Odoo webhook contract and minimize production behavior changes:

```text
Next.js form
→ /api/leads
→ confirmed integration adapter / existing Worker if separately verified
→ Odoo /web/hook/[REDACTED]
→ crm.lead
```

Before enabling production delivery, separately verify the external Worker, request authentication, retries, idempotency, and exact ownership. Extend the adapter contract to preserve landing page, referrer, form name, country, and first-touch UTM values without changing the existing Odoo automation blindly.

Direct Next.js-to-Odoo lead creation is not recommended for the parity cutover: it would duplicate the current mapping and require a new write-capable integration contract, permissions, deduplication, and error handling.

## Unknowns and blockers

- `BLOCKED`: caller and implementation of the claimed `tilda-odoo` Cloudflare Worker were not visible in Odoo or this repository.
- `PARTIAL`: native Tilda webhook receiver and lead mapping are verified, but request authentication/retry/idempotency are not.
- `UNKNOWN`: current external Tilda/Stripe payment path cannot be inferred from Odoo.
- `PARTIAL`: Stripe is enabled in Odoo, but no Odoo payment transaction has ever been recorded in the accessible dataset.
- `NEEDS DESIGN`: first-class CRM fields or a structured description contract for landing/referrer/full UTM attribution.
- `NEEDS CREDENTIALS LATER`: a dedicated least-privilege Odoo integration user/key for production Next.js services; the audit key must not be reused automatically.

No migration implementation or production mutation was performed.
