import type { CommerceNotifier } from "./notification";
import type { OdooCommerceService } from "./odoo";
import type { StripeCommerceClient, StripeCommerceSession } from "./stripe-session";
import type { CommerceOrder, CommerceRepository } from "./types";
import { CommerceIntegrationError, integrationErrorCode } from "./errors";
import { validatePaidStripeSession } from "./validate-session";

export type FulfillmentResult = Readonly<{
  status:
    | "fulfilled"
    | "already_fulfilled"
    | "processing"
    | "payment_pending"
    | "payment_failed"
    | "configuration_pending";
  processed: boolean;
  duplicateSession: boolean;
}>;

function paidOrder(order: CommerceOrder, session: StripeCommerceSession): CommerceOrder {
  return {
    ...order,
    status: "paid",
    stripePaymentIntentId: session.paymentIntentId,
    stripeCustomerId: session.customerId,
    customerEmail: session.customerEmail ?? order.customerEmail,
    customerName: session.customerName,
    customerPhone: session.customerPhone,
    billingAddress: session.billingAddress,
    shippingAddress: session.shippingAddress,
    amountSubtotal: session.amountSubtotal,
    amountDiscount: session.amountDiscount,
    amountShipping: session.amountShipping,
    amountTax: session.amountTax,
    amountTotal: session.amountTotal,
    paidAt: new Date().toISOString(),
  };
}

export async function fulfillStripeCheckout(input: {
  eventId: string;
  eventType: string;
  sessionId: string;
  repository: CommerceRepository;
  stripe: StripeCommerceClient;
  odoo: OdooCommerceService | null;
  notifier: CommerceNotifier;
  now?: () => Date;
}): Promise<FulfillmentResult> {
  const now = (input.now?.() ?? new Date()).toISOString();
  const order = await input.repository.getOrderBySessionId(input.sessionId);
  if (!order) {
    throw new CommerceIntegrationError("COMMERCE_ORDER_NOT_FOUND");
  }
  if (order.fulfillmentStatus === "fulfilled") {
    if (order.notificationStatus !== "sent") {
      const notification = await input.notifier.send(order);
      await input.repository.markNotification(
        order.id,
        notification.status,
        notification.status === "failed" ? notification.errorCode : undefined,
      );
    }
    return { status: "already_fulfilled", processed: true, duplicateSession: true };
  }
  if (input.eventType === "checkout.session.async_payment_failed") {
    await input.repository.markOrderFulfillmentFailed(
      order.id,
      "STRIPE_ASYNC_PAYMENT_FAILED",
    );
    return { status: "payment_failed", processed: true, duplicateSession: false };
  }

  const session = await input.stripe.retrieveSession(input.sessionId);
  if (session.paymentStatus !== "paid") {
    return { status: "payment_pending", processed: true, duplicateSession: false };
  }
  const validation = validatePaidStripeSession(order, session);
  if (!validation.ok) {
    await input.repository.markOrderFulfillmentFailed(order.id, validation.code);
    throw new CommerceIntegrationError(validation.code);
  }

  const paid = paidOrder(order, session);
  await input.repository.markOrderPaid(order.id, {
    stripeEventId: input.eventId,
    stripePaymentIntentId: session.paymentIntentId,
    stripeCustomerId: session.customerId,
    customerEmail: session.customerEmail,
    customerName: session.customerName,
    customerPhone: session.customerPhone,
    billingAddress: session.billingAddress,
    shippingAddress: session.shippingAddress,
    amountSubtotal: session.amountSubtotal,
    amountDiscount: session.amountDiscount,
    amountShipping: session.amountShipping,
    amountTax: session.amountTax,
    amountTotal: session.amountTotal,
    items: session.lineItems.map((item) => ({
      productKey: item.productKey as string,
      subtotalAmount: item.amountSubtotal,
      discountAmount: item.amountDiscount,
      taxAmount: item.amountTax,
      totalAmount: item.amountTotal,
    })),
    paidAt: now,
  });

  const claimed = await input.repository.claimOrderFulfillment(order.id, now);
  if (!claimed) {
    const current = await input.repository.getOrderById(order.id);
    return current?.fulfillmentStatus === "fulfilled"
      ? { status: "already_fulfilled", processed: true, duplicateSession: true }
      : { status: "processing", processed: true, duplicateSession: true };
  }

  if (!input.odoo) {
    await input.repository.markOrderFulfillmentFailed(
      order.id,
      "ODOO_COMMERCE_NOT_CONFIGURED",
    );
    return {
      status: "configuration_pending",
      processed: false,
      duplicateSession: false,
    };
  }

  try {
    const odooResult = await input.odoo.fulfill(paid);
    await input.repository.setOrderItemOdooMapping(order.id, odooResult.mappings);
    await input.repository.markOdooOrder(order.id, {
      partnerId: odooResult.partnerId,
      shippingPartnerId: odooResult.shippingPartnerId,
      saleOrderId: odooResult.saleOrderId,
      saleOrderName: odooResult.saleOrderName,
    });
    const completedOrder: CommerceOrder = {
      ...paid,
      odooPartnerId: odooResult.partnerId,
      odooShippingPartnerId: odooResult.shippingPartnerId,
      odooSaleOrderId: odooResult.saleOrderId,
      odooSaleOrderName: odooResult.saleOrderName,
    };
    const notification = await input.notifier.send(completedOrder);
    await input.repository.markNotification(
      order.id,
      notification.status,
      notification.status === "failed" ? notification.errorCode : undefined,
    );
    await input.repository.markOrderFulfilled(order.id, now);
    return { status: "fulfilled", processed: true, duplicateSession: false };
  } catch (reason) {
    const code = integrationErrorCode(reason);
    await input.repository.markOrderFulfillmentFailed(order.id, code);
    throw reason instanceof CommerceIntegrationError
      ? reason
      : new CommerceIntegrationError(code, true);
  }
}
