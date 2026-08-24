# Payment architecture

## Current verified flow

The read-only audit verifies normal Odoo commercial records but does not verify an executed Odoo Stripe flow.

```text
sale.order (458 records)
├─ sale.order.line (3,211 records)
├─ account.move relation used by 49/100 recent orders
└─ payment.transaction relation available, but unused

payment.provider
└─ Stripe: enabled and published
   ├─ tokenization: supported
   ├─ express checkout: supported
   ├─ manual capture capability: full_only
   └─ methods: Card, Bancontact, EPS, P24, iDEAL

payment.transaction
└─ 0 total records
```

No payment/provider secrets were read.

## Scenario assessment

| Scenario | Status | Evidence |
| --- | --- | --- |
| A: Tilda → Stripe → Tilda → Odoo | UNKNOWN | Odoo has sales/invoices but no transaction records or website attribution; Odoo cannot reveal an external Tilda/Stripe flow |
| B: Odoo Sales Order → Odoo Stripe → `payment.transaction` | PARTIAL / NOT EXECUTED | Stripe provider is enabled, but `payment.transaction` count is zero and recent orders have zero transaction links |
| C: both independently | UNKNOWN | No Odoo transaction evidence and no external Stripe/Tilda audit |

The only defensible conclusion is that Stripe is configured in Odoo but its payment lifecycle is not proven to be in production use.

## Options for Next.js

| Criterion | Option 1: custom Next.js Stripe | Option 2: Odoo order/payment flow |
| --- | --- | --- |
| Data consistency | Requires custom synchronization into Odoo | Odoo remains order/payment source of truth |
| Payment state | New webhook/state machine in Next.js | Existing Odoo transaction model and provider lifecycle |
| Orders/invoices | Must map and reconcile independently | Native order/invoice relations |
| Delivery/accounting | Separate integration required | Native Odoo sales, stock, invoice and journal relations |
| Duplication risk | High | Lower |
| Security surface | New Stripe secrets/webhook verification | Odoo holds provider credentials; Next.js needs a scoped server integration |
| Implementation complexity | Fast initial checkout, expensive reconciliation | More Odoo integration work, simpler long-term ownership |
| Rollback | Must unwind two payment systems | Can disable Next.js entry point while preserving Odoo records |
| Evidence from current audit | No verified custom contract | Provider configuration exists, execution does not |

## Recommended Next.js flow

Recommended target direction: **Option 2**, but not as an immediate production switch.

```text
Next.js server route
→ dedicated integration service/user
→ Odoo quotation/order contract
→ Odoo-controlled payment initiation
→ existing Odoo Stripe provider
→ Stripe
→ Odoo payment.transaction
→ Odoo order/invoice/payment state
→ safe status returned to Next.js
```

Why:

- Odoo already owns sales orders, lines, taxes, delivery, invoices, journals, currencies, products and customers.
- A second Stripe implementation would create duplicate order/payment state and reconciliation logic.
- The Odoo data model already defines transaction-to-order/invoice/customer relations.
- Provider credentials remain outside the browser and outside the Next.js repository.

The recommendation is architectural, not proof that the current provider flow works. Because the accessible database has zero payment transactions, an authorized staging/sandbox transaction is mandatory before any production implementation decision.

## Initial migration policy

For the current Tilda-to-Next.js parity migration:

- do not replace the production payment path yet;
- do not add Stripe Live keys or production payment logic to Next.js;
- the isolated Stripe Test Mode proof of concept in `STRIPE_TEST_POC.md` is an
  explicitly authorized experiment and is not connected to the legacy cart or
  any Odoo/Telegram/order side effect;
- do not create Odoo orders, invoices, or transactions during audit;
- keep checkout/order delivery marked blocked until the business contract is confirmed;
- preserve any existing external payment behavior until separately audited.

## Risks

- Stripe provider may be enabled but never fully commissioned.
- Provider methods include country-specific methods despite no explicit country/currency restriction lists.
- No transaction history exists to verify success, failure, cancellation, refund, authorization, capture, or webhook behavior.
- Existing sales orders have no website attribution in the audited recent sample.
- API key/user permissions used for audit are broader than the minimum website integration should need.
- Creating the same order from retries could duplicate commercial records unless idempotency is designed explicitly.

## Migration steps for a future authorized phase

1. Confirm with finance/sales whether any current Tilda/Stripe checkout exists outside Odoo.
2. Use an Odoo staging/sandbox database and Stripe test mode; do not test writes in production.
3. Define an idempotent order payload and external reference owned by THE BASE.
4. Create a dedicated least-privilege Odoo integration user and rotating API key.
5. Prove quotation/order creation, taxes, delivery, currency, and customer matching.
6. Prove Odoo payment initiation with the configured Stripe provider.
7. Verify `payment.transaction → sale.order → account.move → res.partner` relations through success and failure cases.
8. Verify Stripe webhook authenticity, retries, duplicate delivery, refunds, capture mode, and reconciliation.
9. Add observability without logging PII, API keys, payment references, or webhook secrets.
10. Run a controlled business-owner acceptance test before any production cutover.

Every step after step 1 requires separate authorization. This audit performed no migration implementation and no state mutation.
