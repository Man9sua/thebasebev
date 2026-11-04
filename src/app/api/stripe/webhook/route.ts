import {
  handleStripeWebhook,
} from "@/lib/stripe-webhook";
import { getShopPaymentRuntime } from "@/lib/shop-payment-runtime";
import { createStripeClient } from "@/lib/stripe-client";
import { processPaidSession } from "@/lib/stripe-paid-order";
import { createPaidQuotation } from "@/lib/odoo-paid-order";
import { isStripeKey } from "@/lib/stripe-mode";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const runtime = await getShopPaymentRuntime();
  const client = runtime.secretKey && isStripeKey(runtime.secretKey, runtime.mode) ? createStripeClient(runtime.secretKey) : null;
  return handleStripeWebhook(request, {
    mode: runtime.mode, liveOrigin: runtime.liveOrigin,
    webhookSecret: runtime.webhookSecret,
    processSession: client && runtime.orders && runtime.receiverReady ? id => processPaidSession(id, {
      mode: runtime.mode, orders: runtime.orders!, retrieveSession: client.retrieveSession, listLineItems: client.listLineItems,
      retrievePaymentIntent: client.retrievePaymentIntent,
      createQuotation: (order, session, paymentId) => createPaidQuotation(order, session, paymentId, runtime.odoo),
    }) : undefined,
  });
}
