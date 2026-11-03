import {
  handleStripeTestWebhook,
} from "@/lib/stripe-test-webhook";
import { getShopPaymentRuntime } from "@/lib/shop-payment-runtime";
import { createStripeTestClient } from "@/lib/stripe-test-client";
import { processPaidSession } from "@/lib/stripe-paid-order";
import { createPaidQuotation } from "@/lib/odoo-paid-order";
import { isStripeTestKey } from "@/lib/stripe-test-checkout";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const runtime = await getShopPaymentRuntime();
  const client = runtime.secretKey && isStripeTestKey(runtime.secretKey) ? createStripeTestClient(runtime.secretKey) : null;
  return handleStripeTestWebhook(request, {
    webhookSecret: runtime.webhookSecret,
    processSession: client && runtime.orders && runtime.receiverReady ? id => processPaidSession(id, {
      orders: runtime.orders!, retrieveSession: client.retrieveSession, listLineItems: client.listLineItems,
      retrievePaymentIntent: client.retrievePaymentIntent,
      createQuotation: (order, session, paymentId) => createPaidQuotation(order, session, paymentId, runtime.odoo),
    }) : undefined,
  });
}
