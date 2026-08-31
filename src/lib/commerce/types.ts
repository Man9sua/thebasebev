export type CommerceAddress = Readonly<{
  line1?: string | null;
  line2?: string | null;
  city?: string | null;
  state?: string | null;
  postalCode?: string | null;
  country?: string | null;
}>;

export type CommerceOrderItem = Readonly<{
  productKey: string;
  websiteProductId: string;
  websiteSku: string;
  productName: string;
  quantity: number;
  unitAmount: number;
  subtotalAmount: number;
  discountAmount: number;
  taxAmount: number;
  totalAmount: number;
  odooProductId?: number | null;
  odooDefaultCode?: string | null;
}>;

export type CommerceCheckoutPolicy = Readonly<{
  shippingEnabled: boolean;
  expectedShippingAmount: number;
  automaticTaxEnabled: boolean;
  promotionCodesEnabled: boolean;
}>;

export type CommerceOrder = Readonly<{
  id: string;
  internalReference: string;
  cartVersion: number;
  checkoutPolicy: CommerceCheckoutPolicy;
  stripeSessionId?: string | null;
  stripePaymentIntentId?: string | null;
  stripeEventId?: string | null;
  stripeCustomerId?: string | null;
  status: string;
  currency: "aed";
  amountSubtotal: number;
  amountDiscount: number;
  amountShipping: number;
  amountTax: number;
  amountTotal: number;
  customerEmail?: string | null;
  customerName?: string | null;
  customerPhone?: string | null;
  billingAddress?: CommerceAddress | null;
  shippingAddress?: CommerceAddress | null;
  odooPartnerId?: number | null;
  odooShippingPartnerId?: number | null;
  odooSaleOrderId?: number | null;
  odooSaleOrderName?: string | null;
  odooInvoiceId?: number | null;
  fulfillmentStatus: string;
  notificationStatus: string;
  notificationError?: string | null;
  createdAt: string;
  paidAt?: string | null;
  fulfilledAt?: string | null;
  updatedAt: string;
  lastError?: string | null;
  items: readonly CommerceOrderItem[];
}>;

export type PaidOrderUpdate = Readonly<{
  stripeEventId: string;
  stripePaymentIntentId?: string | null;
  stripeCustomerId?: string | null;
  customerEmail?: string | null;
  customerName?: string | null;
  customerPhone?: string | null;
  billingAddress?: CommerceAddress | null;
  shippingAddress?: CommerceAddress | null;
  amountSubtotal: number;
  amountDiscount: number;
  amountShipping: number;
  amountTax: number;
  amountTotal: number;
  items: readonly Readonly<{
    productKey: string;
    subtotalAmount: number;
    discountAmount: number;
    taxAmount: number;
    totalAmount: number;
  }>[];
  paidAt: string;
}>;

export type OdooOrderReferences = Readonly<{
  partnerId: number;
  shippingPartnerId?: number | null;
  saleOrderId: number;
  saleOrderName: string;
}>;

export type WebhookClaim = Readonly<{
  duplicateEvent: boolean;
  attempts: number;
  processingStatus: string;
}>;

export interface CommerceRepository {
  createCheckoutOrder(order: CommerceOrder): Promise<void>;
  attachStripeSession(orderId: string, stripeSessionId: string): Promise<void>;
  markCheckoutFailed(orderId: string, errorCode: string): Promise<void>;
  getOrderById(orderId: string): Promise<CommerceOrder | null>;
  getOrderBySessionId(sessionId: string): Promise<CommerceOrder | null>;
  claimWebhookEvent(input: {
    eventId: string;
    eventType: string;
    sessionId?: string | null;
    now: string;
  }): Promise<WebhookClaim>;
  claimOrderFulfillment(orderId: string, now: string): Promise<boolean>;
  markOrderPaid(orderId: string, update: PaidOrderUpdate): Promise<void>;
  setOrderItemOdooMapping(
    orderId: string,
    mappings: readonly Readonly<{
      productKey: string;
      odooProductId: number;
      odooDefaultCode: string;
    }>[],
  ): Promise<void>;
  markOdooOrder(orderId: string, references: OdooOrderReferences): Promise<void>;
  markOrderFulfilled(orderId: string, fulfilledAt: string): Promise<void>;
  markOrderFulfillmentFailed(orderId: string, errorCode: string): Promise<void>;
  markNotification(
    orderId: string,
    status: "sent" | "failed" | "not_configured",
    errorCode?: string,
  ): Promise<void>;
  markWebhookProcessed(eventId: string, processedAt: string): Promise<void>;
  markWebhookFailed(eventId: string, errorCode: string): Promise<void>;
}
