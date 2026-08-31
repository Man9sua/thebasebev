import type { CommerceOrder } from "./types";
import type { StripeCommerceSession } from "./stripe-session";

export type SessionValidation =
  | { ok: true }
  | { ok: false; code: string };

export function validatePaidStripeSession(
  order: CommerceOrder,
  session: StripeCommerceSession,
): SessionValidation {
  if (session.livemode || !session.id.startsWith("cs_test_")) {
    return { ok: false, code: "STRIPE_LIVE_SESSION_REJECTED" };
  }
  if (session.mode !== "payment") {
    return { ok: false, code: "STRIPE_SESSION_MODE_INVALID" };
  }
  if (session.paymentStatus !== "paid") {
    return { ok: false, code: "STRIPE_SESSION_NOT_PAID" };
  }
  if (session.currency?.toLowerCase() !== "aed") {
    return { ok: false, code: "STRIPE_SESSION_CURRENCY_MISMATCH" };
  }
  if (
    session.clientReferenceId !== order.id ||
    session.internalOrderId !== order.id
  ) {
    return { ok: false, code: "STRIPE_SESSION_ORDER_MISMATCH" };
  }
  if (session.amountSubtotal !== order.amountSubtotal) {
    return { ok: false, code: "STRIPE_SUBTOTAL_MISMATCH" };
  }
  if (
    session.amountShipping !== order.checkoutPolicy.expectedShippingAmount ||
    (!order.checkoutPolicy.shippingEnabled && session.amountShipping !== 0)
  ) {
    return { ok: false, code: "STRIPE_SHIPPING_MISMATCH" };
  }
  if (!order.checkoutPolicy.automaticTaxEnabled && session.amountTax !== 0) {
    return { ok: false, code: "STRIPE_TAX_NOT_CONFIGURED" };
  }
  if (!order.checkoutPolicy.promotionCodesEnabled && session.amountDiscount !== 0) {
    return { ok: false, code: "STRIPE_DISCOUNT_NOT_CONFIGURED" };
  }
  const calculatedTotal =
    session.amountSubtotal -
    session.amountDiscount +
    session.amountShipping +
    session.amountTax;
  if (session.amountTotal !== calculatedTotal) {
    return { ok: false, code: "STRIPE_TOTAL_ARITHMETIC_MISMATCH" };
  }
  if (session.lineItems.length !== order.items.length) {
    return { ok: false, code: "STRIPE_LINE_ITEM_COUNT_MISMATCH" };
  }

  const byProduct = new Map(session.lineItems.map((item) => [item.productKey, item]));
  for (const expected of order.items) {
    const actual = byProduct.get(expected.productKey);
    if (!actual) return { ok: false, code: "STRIPE_UNKNOWN_PRODUCT" };
    if (
      actual.websiteProductId !== expected.websiteProductId ||
      actual.websiteSku !== expected.websiteSku ||
      actual.currency.toLowerCase() !== "aed" ||
      actual.quantity !== expected.quantity ||
      actual.unitAmount !== expected.unitAmount ||
      actual.amountSubtotal !== expected.subtotalAmount
    ) {
      return { ok: false, code: "STRIPE_LINE_ITEM_MISMATCH" };
    }
  }

  return { ok: true };
}
