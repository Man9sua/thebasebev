import type { StripeCommerceClient } from "./stripe-session";
import type { CommerceRepository } from "./types";
import { validatePaidStripeSession } from "./validate-session";

export type PublicCheckoutStatus = Readonly<{
  paymentConfirmed: boolean;
  paymentStatus: string;
  fulfillmentStatus: string;
  orderReference: string;
  amountTotal: number;
  currency: string;
  odooOrderReference?: string | null;
}>;

export type CheckoutStatusResult =
  | { ok: true; order: PublicCheckoutStatus }
  | { ok: false; status: number; code: string };

export function isStripeTestSessionId(sessionId: string) {
  return /^cs_test_[A-Za-z0-9_]+$/.test(sessionId) && sessionId.length <= 255;
}

export async function getVerifiedCheckoutStatus(input: {
  sessionId: string;
  repository: CommerceRepository;
  stripe: StripeCommerceClient;
}): Promise<CheckoutStatusResult> {
  if (!isStripeTestSessionId(input.sessionId)) {
    return { ok: false, status: 400, code: "STRIPE_SESSION_ID_INVALID" };
  }
  const order = await input.repository.getOrderBySessionId(input.sessionId);
  if (!order) return { ok: false, status: 404, code: "COMMERCE_ORDER_NOT_FOUND" };

  let session;
  try {
    session = await input.stripe.retrieveSession(input.sessionId);
  } catch {
    return { ok: false, status: 503, code: "STRIPE_SESSION_UNAVAILABLE" };
  }
  const validation = validatePaidStripeSession(order, session);
  const paymentConfirmed = validation.ok;
  return {
    ok: true,
    order: {
      paymentConfirmed,
      paymentStatus: paymentConfirmed ? "paid" : session.paymentStatus,
      fulfillmentStatus: order.fulfillmentStatus,
      orderReference: order.internalReference,
      amountTotal: session.amountTotal,
      currency: session.currency?.toUpperCase() ?? "AED",
      odooOrderReference:
        order.fulfillmentStatus === "fulfilled"
          ? order.odooSaleOrderName ?? null
          : null,
    },
  };
}

export function shouldClearCartAfterVerification(status: PublicCheckoutStatus) {
  return status.paymentConfirmed === true;
}
