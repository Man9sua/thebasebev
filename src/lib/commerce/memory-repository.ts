import type {
  CommerceOrder,
  CommerceRepository,
  OdooOrderReferences,
  PaidOrderUpdate,
  WebhookClaim,
} from "./types";

type WebhookEventState = {
  attempts: number;
  processingStatus: string;
  lastError?: string;
};

function cloneOrder(order: CommerceOrder): CommerceOrder {
  return structuredClone(order);
}

/** Test-only repository. Runtime routes resolve the D1 implementation. */
export class MemoryCommerceRepository implements CommerceRepository {
  private readonly orders = new Map<string, CommerceOrder>();
  private readonly sessionToOrder = new Map<string, string>();
  private readonly webhookEvents = new Map<string, WebhookEventState>();

  async createCheckoutOrder(order: CommerceOrder) {
    if (this.orders.has(order.id)) throw new Error("COMMERCE_ORDER_DUPLICATE");
    this.orders.set(order.id, cloneOrder(order));
  }

  async attachStripeSession(orderId: string, stripeSessionId: string) {
    if (this.sessionToOrder.has(stripeSessionId)) {
      throw new Error("COMMERCE_SESSION_DUPLICATE");
    }
    this.sessionToOrder.set(stripeSessionId, orderId);
    this.update(orderId, { stripeSessionId, status: "checkout_created" });
  }

  async markCheckoutFailed(orderId: string, errorCode: string) {
    this.update(orderId, { status: "checkout_failed", lastError: errorCode });
  }

  async getOrderById(orderId: string) {
    const order = this.orders.get(orderId);
    return order ? cloneOrder(order) : null;
  }

  async getOrderBySessionId(sessionId: string) {
    const orderId = this.sessionToOrder.get(sessionId);
    return orderId ? this.getOrderById(orderId) : null;
  }

  async claimWebhookEvent(input: {
    eventId: string;
    eventType: string;
    sessionId?: string | null;
    now: string;
  }): Promise<WebhookClaim> {
    const existing = this.webhookEvents.get(input.eventId);
    if (existing) {
      existing.attempts += 1;
      return {
        duplicateEvent: true,
        attempts: existing.attempts,
        processingStatus: existing.processingStatus,
      };
    }
    this.webhookEvents.set(input.eventId, {
      attempts: 1,
      processingStatus: "processing",
    });
    return { duplicateEvent: false, attempts: 1, processingStatus: "processing" };
  }

  async claimOrderFulfillment(orderId: string, now: string) {
    void now;
    const order = this.require(orderId);
    if (!["pending", "failed", "pending_configuration"].includes(order.fulfillmentStatus)) {
      return false;
    }
    this.update(orderId, { fulfillmentStatus: "processing" });
    return true;
  }

  async markOrderPaid(orderId: string, update: PaidOrderUpdate) {
    const order = this.require(orderId);
    const paidItems = new Map(update.items.map((item) => [item.productKey, item]));
    this.update(orderId, {
      stripeEventId: update.stripeEventId,
      stripePaymentIntentId: update.stripePaymentIntentId,
      stripeCustomerId: update.stripeCustomerId,
      status: order.status === "fulfilled" ? "fulfilled" : "paid",
      customerEmail: update.customerEmail ?? order.customerEmail,
      customerName: update.customerName ?? order.customerName,
      customerPhone: update.customerPhone ?? order.customerPhone,
      billingAddress: update.billingAddress,
      shippingAddress: update.shippingAddress,
      amountSubtotal: update.amountSubtotal,
      amountDiscount: update.amountDiscount,
      amountShipping: update.amountShipping,
      amountTax: update.amountTax,
      amountTotal: update.amountTotal,
      items: order.items.map((item) => {
        const paid = paidItems.get(item.productKey);
        return paid
          ? {
              ...item,
              subtotalAmount: paid.subtotalAmount,
              discountAmount: paid.discountAmount,
              taxAmount: paid.taxAmount,
              totalAmount: paid.totalAmount,
            }
          : item;
      }),
      paidAt: order.paidAt ?? update.paidAt,
      lastError: null,
    });
  }

  async setOrderItemOdooMapping(
    orderId: string,
    mappings: readonly Readonly<{
      productKey: string;
      odooProductId: number;
      odooDefaultCode: string;
    }>[],
  ) {
    const order = this.require(orderId);
    const byKey = new Map(mappings.map((mapping) => [mapping.productKey, mapping]));
    this.update(orderId, {
      items: order.items.map((item) => {
        const mapping = byKey.get(item.productKey);
        return mapping
          ? { ...item, odooProductId: mapping.odooProductId, odooDefaultCode: mapping.odooDefaultCode }
          : item;
      }),
    });
  }

  async markOdooOrder(orderId: string, references: OdooOrderReferences) {
    this.update(orderId, {
      odooPartnerId: references.partnerId,
      odooShippingPartnerId: references.shippingPartnerId,
      odooSaleOrderId: references.saleOrderId,
      odooSaleOrderName: references.saleOrderName,
    });
  }

  async markOrderFulfilled(orderId: string, fulfilledAt: string) {
    this.update(orderId, {
      status: "fulfilled",
      fulfillmentStatus: "fulfilled",
      fulfilledAt,
      lastError: null,
    });
  }

  async markOrderFulfillmentFailed(orderId: string, errorCode: string) {
    this.update(orderId, { fulfillmentStatus: "failed", lastError: errorCode });
  }

  async markNotification(
    orderId: string,
    status: "sent" | "failed" | "not_configured",
    errorCode?: string,
  ) {
    this.update(orderId, {
      notificationStatus: status,
      notificationError: errorCode ?? null,
    });
  }

  async markWebhookProcessed(eventId: string, processedAt: string) {
    void processedAt;
    const event = this.webhookEvents.get(eventId);
    if (event) {
      event.processingStatus = "processed";
      event.lastError = undefined;
    }
  }

  async markWebhookFailed(eventId: string, errorCode: string) {
    const event = this.webhookEvents.get(eventId);
    if (event) {
      event.processingStatus = "failed";
      event.lastError = errorCode;
    }
  }

  webhookAttempts(eventId: string) {
    return this.webhookEvents.get(eventId)?.attempts ?? 0;
  }

  private require(orderId: string) {
    const order = this.orders.get(orderId);
    if (!order) throw new Error("COMMERCE_ORDER_NOT_FOUND");
    return order;
  }

  private update(orderId: string, patch: Partial<CommerceOrder>) {
    const order = this.require(orderId);
    this.orders.set(
      orderId,
      cloneOrder({ ...order, ...patch, updatedAt: new Date().toISOString() }),
    );
  }
}
