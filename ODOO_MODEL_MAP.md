# Odoo model map

Read-only model/relationship map captured from Odoo `19.0+e` on 2026-08-24. Every listed required model passed `fields_get` and `search_count` for the current API user.

| Model | Purpose | Important fields | Relations | Used by website? | Visible records |
| --- | --- | --- | --- | --- | ---: |
| `crm.lead` | B2B leads/opportunities | `name`, `type`, `stage_id`, `description`, `email_from`, `phone`, `website`, `source_id`, `medium_id`, `campaign_id`, `tag_ids` | partner, country, CRM stage, UTM, tags, R&D records | YES — Tilda webhook creates records | 306 |
| `sale.order` | Quotations/orders | `state`, `currency_id`, `amount_*`, `invoice_status`, `delivery_status`, `source_id`, `medium_id`, `campaign_id` | customer, lines, invoices, transactions, pickings, carrier, UTM | NOT VERIFIED for current website | 458 |
| `sale.order.line` | Products, quantities, prices and taxes | `product_id`, `product_uom_qty`, `price_unit`, `discount`, `tax_ids`, `price_subtotal`, `price_total` | order, product, currency, taxes | INDIRECT via sales order | 3,211 |
| `res.partner` | Companies/customers/contacts | `name`, `type`, `country_id`, `website`, contact fields | sales orders, invoices, company, country | INDIRECT; PII-bearing | 702 |
| `product.template` | Shared product definition | `name`, `type`, `description`, packaging/custom logistics fields | product variants, company, currency | POSSIBLE FUTURE catalogue/order source | 1,414 |
| `product.product` | Saleable product variant | `name`, `code`, `product_tmpl_id`, packaging/custom logistics fields | template, order lines, company, currency | INDIRECT through order lines | 1,416 |
| `payment.provider` | Provider configuration | `name`, `code`, `state`, `is_published`, tokenization/checkout/capture support | company, journal, methods, countries, currencies | CONFIGURED — Stripe and COD enabled | 25 |
| `payment.transaction` | Payment lifecycle | `state`, `amount`, `provider_code`, `reference`, `provider_reference` | provider, payment method, sale orders, invoices, customer, currency | NOT USED in accessible data | 0 |
| `account.move` | Invoices, bills and journal entries | `move_type`, `state`, `payment_state`, `amount_*`, `invoice_origin`, UTM fields | customer, journal, currency, payment transactions | INDIRECT through invoicing | 10,738 |
| `utm.source` | Attribution source | `name` | CRM leads, sales, invoices | YES — exact Tilda source observed | 24 |
| `utm.medium` | Attribution medium | `name`, `active` | CRM leads, sales, invoices | YES — Website medium observed | 16 |
| `utm.campaign` | Attribution campaign | `name`, `active`, `stage_id`, `tag_ids` | CRM leads, sales, invoices | AVAILABLE, not populated in recent CRM sample | 1 |
| `base.automation` | Trigger/filter/action orchestration | `name`, `active`, `trigger`, `filter_domain`, `webhook_uuid`, `url`, `log_webhook_calls` | target model, server actions, trigger fields | YES — native Tilda webhook | 10 |
| `ir.actions.server` | Server-side business action | `name`, `state`, `code`, `model_id`, `crud_model_id`, `fields_lines` | target model, automation | YES — creates Tilda CRM lead | 297 |
| `payment.method` | Payment method metadata | `name`, `code`, `active`, `is_primary` | payment providers and transactions | CONFIGURED through Stripe | at least 5 linked |

## Verified website-oriented relationship graph

```text
base.automation
  └─ action_server_ids → ir.actions.server
       └─ code creates → crm.lead
            ├─ source_id → utm.source
            ├─ medium_id → utm.medium
            ├─ campaign_id → utm.campaign
            ├─ tag_ids → crm.tag
            └─ partner_id → res.partner

sale.order
  ├─ order_line → sale.order.line
  │    ├─ product_id → product.product
  │    │    └─ product_tmpl_id → product.template
  │    └─ tax_ids → account.tax
  ├─ invoice_ids → account.move
  ├─ transaction_ids → payment.transaction
  ├─ picking_ids → stock.picking
  ├─ carrier_id → delivery.carrier
  ├─ source_id → utm.source
  ├─ medium_id → utm.medium
  └─ campaign_id → utm.campaign

payment.transaction
  ├─ provider_id → payment.provider
  ├─ payment_method_id → payment.method
  ├─ sale_order_ids → sale.order
  ├─ invoice_ids → account.move
  └─ partner_id → res.partner
```

The transaction relationship schema exists, but there are zero accessible `payment.transaction` records. Relations describe capability, not verified production use.

## Attribution gap

Current CRM has standard UTM relations but no dedicated fields for:

```text
form_name
landing_page
referrer
utm_content
utm_term
first-touch attribution timestamp/value set
```

Those values must not be silently discarded when replacing Tilda forms. A future write integration needs an explicit field/description contract approved by the CRM owner.

## Sensitive models/fields

`res.partner`, `crm.lead`, `payment.transaction`, and `account.move` contain PII, financial, or provider-reference fields. Reports and diagnostics must aggregate or mask their records. Provider credential-like fields were discovered through metadata but deliberately not read.
