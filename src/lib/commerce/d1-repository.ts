import type {
  CommerceAddress,
  CommerceOrder,
  CommerceOrderItem,
  CommerceRepository,
  OdooOrderReferences,
  PaidOrderUpdate,
  WebhookClaim,
} from "./types";

export interface D1PreparedStatementLike {
  bind(...values: unknown[]): D1PreparedStatementLike;
  first<T = Record<string, unknown>>(): Promise<T | null>;
  run(): Promise<{ success: boolean }>;
}

export interface D1DatabaseLike {
  prepare(query: string): D1PreparedStatementLike;
  batch(statements: readonly D1PreparedStatementLike[]): Promise<unknown[]>;
}

type OrderRow = Readonly<{
  id: string;
  internal_reference: string;
  cart_version: number;
  checkout_policy_json: string;
  stripe_session_id: string | null;
  stripe_payment_intent_id: string | null;
  stripe_event_id: string | null;
  stripe_customer_id: string | null;
  status: string;
  currency: "aed";
  amount_subtotal: number;
  amount_discount: number;
  amount_shipping: number;
  amount_tax: number;
  amount_total: number;
  customer_email: string | null;
  customer_name: string | null;
  customer_phone: string | null;
  billing_address_json: string | null;
  shipping_address_json: string | null;
  odoo_partner_id: number | null;
  odoo_shipping_partner_id: number | null;
  odoo_sale_order_id: number | null;
  odoo_sale_order_name: string | null;
  odoo_invoice_id: number | null;
  fulfillment_status: string;
  notification_status: string;
  notification_error: string | null;
  created_at: string;
  paid_at: string | null;
  fulfilled_at: string | null;
  updated_at: string;
  last_error: string | null;
}>;

type ItemRow = Readonly<{
  product_key: string;
  website_product_id: string;
  website_sku: string;
  product_name_snapshot: string;
  quantity: number;
  unit_amount: number;
  subtotal_amount: number;
  discount_amount: number;
  tax_amount: number;
  total_amount: number;
  odoo_product_id: number | null;
  odoo_default_code: string | null;
}>;

function parseAddress(value: string | null): CommerceAddress | null {
  if (!value) return null;
  try {
    const parsed = JSON.parse(value);
    return parsed && typeof parsed === "object" ? parsed : null;
  } catch {
    return null;
  }
}

function mapItem(row: ItemRow): CommerceOrderItem {
  return {
    productKey: row.product_key,
    websiteProductId: row.website_product_id,
    websiteSku: row.website_sku,
    productName: row.product_name_snapshot,
    quantity: row.quantity,
    unitAmount: row.unit_amount,
    subtotalAmount: row.subtotal_amount,
    discountAmount: row.discount_amount,
    taxAmount: row.tax_amount,
    totalAmount: row.total_amount,
    odooProductId: row.odoo_product_id,
    odooDefaultCode: row.odoo_default_code,
  };
}

async function readItems(database: D1DatabaseLike, orderId: string) {
  const aggregate = await database
    .prepare(
      `SELECT json_group_array(json_object(
          'product_key', product_key,
          'website_product_id', website_product_id,
          'website_sku', website_sku,
          'product_name_snapshot', product_name_snapshot,
          'quantity', quantity,
          'unit_amount', unit_amount,
          'subtotal_amount', subtotal_amount,
          'discount_amount', discount_amount,
          'tax_amount', tax_amount,
          'total_amount', total_amount,
          'odoo_product_id', odoo_product_id,
          'odoo_default_code', odoo_default_code
        )) AS items_json
       FROM (
         SELECT * FROM commerce_order_items WHERE order_id = ? ORDER BY id ASC
       )`,
    )
    .bind(orderId)
    .first<{ items_json: string | null }>();
  if (!aggregate?.items_json) return [];
  return (JSON.parse(aggregate.items_json) as ItemRow[]).map(mapItem);
}

function parseCheckoutPolicy(value: string): CommerceOrder["checkoutPolicy"] {
  try {
    const parsed = JSON.parse(value) as Partial<CommerceOrder["checkoutPolicy"]>;
    return {
      shippingEnabled: parsed.shippingEnabled === true,
      expectedShippingAmount:
        Number.isInteger(parsed.expectedShippingAmount) &&
        Number(parsed.expectedShippingAmount) >= 0
          ? Number(parsed.expectedShippingAmount)
          : 0,
      automaticTaxEnabled: parsed.automaticTaxEnabled === true,
      promotionCodesEnabled: parsed.promotionCodesEnabled === true,
    };
  } catch {
    return {
      shippingEnabled: false,
      expectedShippingAmount: 0,
      automaticTaxEnabled: false,
      promotionCodesEnabled: false,
    };
  }
}

async function mapOrder(
  database: D1DatabaseLike,
  row: OrderRow | null,
): Promise<CommerceOrder | null> {
  if (!row) return null;
  return {
    id: row.id,
    internalReference: row.internal_reference,
    cartVersion: row.cart_version,
    checkoutPolicy: parseCheckoutPolicy(row.checkout_policy_json),
    stripeSessionId: row.stripe_session_id,
    stripePaymentIntentId: row.stripe_payment_intent_id,
    stripeEventId: row.stripe_event_id,
    stripeCustomerId: row.stripe_customer_id,
    status: row.status,
    currency: row.currency,
    amountSubtotal: row.amount_subtotal,
    amountDiscount: row.amount_discount,
    amountShipping: row.amount_shipping,
    amountTax: row.amount_tax,
    amountTotal: row.amount_total,
    customerEmail: row.customer_email,
    customerName: row.customer_name,
    customerPhone: row.customer_phone,
    billingAddress: parseAddress(row.billing_address_json),
    shippingAddress: parseAddress(row.shipping_address_json),
    odooPartnerId: row.odoo_partner_id,
    odooShippingPartnerId: row.odoo_shipping_partner_id,
    odooSaleOrderId: row.odoo_sale_order_id,
    odooSaleOrderName: row.odoo_sale_order_name,
    odooInvoiceId: row.odoo_invoice_id,
    fulfillmentStatus: row.fulfillment_status,
    notificationStatus: row.notification_status,
    notificationError: row.notification_error,
    createdAt: row.created_at,
    paidAt: row.paid_at,
    fulfilledAt: row.fulfilled_at,
    updatedAt: row.updated_at,
    lastError: row.last_error,
    items: await readItems(database, row.id),
  };
}

const ORDER_COLUMNS = `id, internal_reference, cart_version, checkout_policy_json, stripe_session_id,
  stripe_payment_intent_id, stripe_event_id, stripe_customer_id, status, currency,
  amount_subtotal, amount_discount, amount_shipping, amount_tax, amount_total,
  customer_email, customer_name, customer_phone, billing_address_json,
  shipping_address_json, odoo_partner_id, odoo_shipping_partner_id,
  odoo_sale_order_id, odoo_sale_order_name, odoo_invoice_id, fulfillment_status,
  notification_status, notification_error, created_at, paid_at, fulfilled_at,
  updated_at, last_error`;

export class D1CommerceRepository implements CommerceRepository {
  constructor(private readonly database: D1DatabaseLike) {}

  async createCheckoutOrder(order: CommerceOrder) {
    const orderStatement = this.database
      .prepare(
        `INSERT INTO commerce_orders (
          id, internal_reference, cart_version, checkout_policy_json, status, currency, amount_subtotal,
          amount_discount, amount_shipping, amount_tax, amount_total,
          customer_email, fulfillment_status, notification_status, created_at,
          updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      )
      .bind(
        order.id,
        order.internalReference,
        order.cartVersion,
        JSON.stringify(order.checkoutPolicy),
        order.status,
        order.currency,
        order.amountSubtotal,
        order.amountDiscount,
        order.amountShipping,
        order.amountTax,
        order.amountTotal,
        order.customerEmail ?? null,
        order.fulfillmentStatus,
        order.notificationStatus,
        order.createdAt,
        order.updatedAt,
      );
    const itemStatements = order.items.map((item) =>
      this.database
        .prepare(
          `INSERT INTO commerce_order_items (
            order_id, product_key, website_product_id, website_sku,
            product_name_snapshot, quantity, unit_amount, subtotal_amount,
            discount_amount, tax_amount, total_amount
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        )
        .bind(
          order.id,
          item.productKey,
          item.websiteProductId,
          item.websiteSku,
          item.productName,
          item.quantity,
          item.unitAmount,
          item.subtotalAmount,
          item.discountAmount,
          item.taxAmount,
          item.totalAmount,
        ),
    );
    await this.database.batch([orderStatement, ...itemStatements]);
  }

  async attachStripeSession(orderId: string, stripeSessionId: string) {
    await this.database
      .prepare(
        `UPDATE commerce_orders
            SET stripe_session_id = ?, status = 'checkout_created', updated_at = ?
          WHERE id = ?`,
      )
      .bind(stripeSessionId, new Date().toISOString(), orderId)
      .run();
  }

  async markCheckoutFailed(orderId: string, errorCode: string) {
    await this.database
      .prepare(
        `UPDATE commerce_orders
            SET status = 'checkout_failed', last_error = ?, updated_at = ?
          WHERE id = ?`,
      )
      .bind(errorCode, new Date().toISOString(), orderId)
      .run();
  }

  async getOrderById(orderId: string) {
    const row = await this.database
      .prepare(`SELECT ${ORDER_COLUMNS} FROM commerce_orders WHERE id = ?`)
      .bind(orderId)
      .first<OrderRow>();
    return mapOrder(this.database, row);
  }

  async getOrderBySessionId(sessionId: string) {
    const row = await this.database
      .prepare(`SELECT ${ORDER_COLUMNS} FROM commerce_orders WHERE stripe_session_id = ?`)
      .bind(sessionId)
      .first<OrderRow>();
    return mapOrder(this.database, row);
  }

  async claimWebhookEvent(input: {
    eventId: string;
    eventType: string;
    sessionId?: string | null;
    now: string;
  }): Promise<WebhookClaim> {
    const row = await this.database
      .prepare(
        `INSERT INTO stripe_webhook_events (
          stripe_event_id, event_type, stripe_session_id, processing_status,
          attempts, created_at, updated_at
        ) VALUES (?, ?, ?, 'processing', 1, ?, ?)
        ON CONFLICT(stripe_event_id) DO UPDATE SET
          attempts = attempts + 1,
          updated_at = excluded.updated_at
        RETURNING attempts, processing_status`,
      )
      .bind(input.eventId, input.eventType, input.sessionId ?? null, input.now, input.now)
      .first<{ attempts: number; processing_status: string }>();
    if (!row) throw new Error("COMMERCE_EVENT_CLAIM_FAILED");
    return {
      duplicateEvent: row.attempts > 1,
      attempts: row.attempts,
      processingStatus: row.processing_status,
    };
  }

  async claimOrderFulfillment(orderId: string, now: string) {
    const staleAt = new Date(Date.parse(now) - 5 * 60_000).toISOString();
    const row = await this.database
      .prepare(
        `UPDATE commerce_orders
            SET fulfillment_status = 'processing', fulfillment_lock_at = ?, updated_at = ?
          WHERE id = ?
            AND (
              fulfillment_status IN ('pending', 'failed', 'pending_configuration')
              OR (fulfillment_status = 'processing' AND fulfillment_lock_at < ?)
            )
        RETURNING id`,
      )
      .bind(now, now, orderId, staleAt)
      .first<{ id: string }>();
    return Boolean(row);
  }

  async markOrderPaid(orderId: string, update: PaidOrderUpdate) {
    const orderStatement = this.database
      .prepare(
        `UPDATE commerce_orders SET
          stripe_event_id = ?, stripe_payment_intent_id = ?, stripe_customer_id = ?,
          status = CASE WHEN status = 'fulfilled' THEN status ELSE 'paid' END,
          customer_email = COALESCE(?, customer_email),
          customer_name = COALESCE(?, customer_name),
          customer_phone = COALESCE(?, customer_phone),
          billing_address_json = ?, shipping_address_json = ?,
          amount_subtotal = ?, amount_discount = ?, amount_shipping = ?,
          amount_tax = ?, amount_total = ?, paid_at = COALESCE(paid_at, ?),
          last_error = NULL, updated_at = ?
        WHERE id = ?`,
      )
      .bind(
        update.stripeEventId,
        update.stripePaymentIntentId ?? null,
        update.stripeCustomerId ?? null,
        update.customerEmail ?? null,
        update.customerName ?? null,
        update.customerPhone ?? null,
        update.billingAddress ? JSON.stringify(update.billingAddress) : null,
        update.shippingAddress ? JSON.stringify(update.shippingAddress) : null,
        update.amountSubtotal,
        update.amountDiscount,
        update.amountShipping,
        update.amountTax,
        update.amountTotal,
        update.paidAt,
        update.paidAt,
        orderId,
      );
    const itemStatements = update.items.map((item) =>
      this.database
        .prepare(
          `UPDATE commerce_order_items SET
            subtotal_amount = ?, discount_amount = ?, tax_amount = ?, total_amount = ?
          WHERE order_id = ? AND product_key = ?`,
        )
        .bind(
          item.subtotalAmount,
          item.discountAmount,
          item.taxAmount,
          item.totalAmount,
          orderId,
          item.productKey,
        ),
    );
    await this.database.batch([orderStatement, ...itemStatements]);
  }

  async setOrderItemOdooMapping(
    orderId: string,
    mappings: readonly Readonly<{
      productKey: string;
      odooProductId: number;
      odooDefaultCode: string;
    }>[],
  ) {
    await this.database.batch(
      mappings.map((mapping) =>
        this.database
          .prepare(
            `UPDATE commerce_order_items
                SET odoo_product_id = ?, odoo_default_code = ?
              WHERE order_id = ? AND product_key = ?`,
          )
          .bind(mapping.odooProductId, mapping.odooDefaultCode, orderId, mapping.productKey),
      ),
    );
  }

  async markOdooOrder(orderId: string, references: OdooOrderReferences) {
    await this.database
      .prepare(
        `UPDATE commerce_orders SET
          odoo_partner_id = ?, odoo_shipping_partner_id = ?,
          odoo_sale_order_id = ?, odoo_sale_order_name = ?, updated_at = ?
        WHERE id = ?`,
      )
      .bind(
        references.partnerId,
        references.shippingPartnerId ?? null,
        references.saleOrderId,
        references.saleOrderName,
        new Date().toISOString(),
        orderId,
      )
      .run();
  }

  async markOrderFulfilled(orderId: string, fulfilledAt: string) {
    await this.database
      .prepare(
        `UPDATE commerce_orders SET
          status = 'fulfilled', fulfillment_status = 'fulfilled', fulfilled_at = ?,
          fulfillment_lock_at = NULL, last_error = NULL, updated_at = ?
        WHERE id = ?`,
      )
      .bind(fulfilledAt, fulfilledAt, orderId)
      .run();
  }

  async markOrderFulfillmentFailed(orderId: string, errorCode: string) {
    await this.database
      .prepare(
        `UPDATE commerce_orders SET
          fulfillment_status = 'failed', fulfillment_lock_at = NULL,
          last_error = ?, updated_at = ?
        WHERE id = ?`,
      )
      .bind(errorCode, new Date().toISOString(), orderId)
      .run();
  }

  async markNotification(
    orderId: string,
    status: "sent" | "failed" | "not_configured",
    errorCode?: string,
  ) {
    await this.database
      .prepare(
        `UPDATE commerce_orders SET
          notification_status = ?, notification_error = ?, updated_at = ?
        WHERE id = ?`,
      )
      .bind(status, errorCode ?? null, new Date().toISOString(), orderId)
      .run();
  }

  async markWebhookProcessed(eventId: string, processedAt: string) {
    await this.database
      .prepare(
        `UPDATE stripe_webhook_events SET
          processing_status = 'processed', processed_at = ?, last_error = NULL,
          updated_at = ? WHERE stripe_event_id = ?`,
      )
      .bind(processedAt, processedAt, eventId)
      .run();
  }

  async markWebhookFailed(eventId: string, errorCode: string) {
    await this.database
      .prepare(
        `UPDATE stripe_webhook_events SET
          processing_status = 'failed', last_error = ?, updated_at = ?
        WHERE stripe_event_id = ?`,
      )
      .bind(errorCode, new Date().toISOString(), eventId)
      .run();
  }
}
