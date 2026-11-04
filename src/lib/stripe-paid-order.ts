import type Stripe from "stripe";
import type { OrderStore, StoredOrder } from "./shop-order";
import type { QuotationResult } from "./odoo-paid-order";
import { isStripeSessionId, stripeIntegration, type StripeMode } from "./stripe-mode";

export type PaidOrderDependencies = {
  mode?: StripeMode;
  orders: OrderStore;
  retrieveSession(id: string): Promise<Stripe.Checkout.Session>;
  listLineItems(id: string): Promise<Stripe.ApiList<Stripe.LineItem>>;
  retrievePaymentIntent(id: string): Promise<Stripe.PaymentIntent>;
  createQuotation(order: StoredOrder, session: Stripe.Checkout.Session, paymentId: string): Promise<QuotationResult>;
};

export function verifySessionSnapshot(session: Stripe.Checkout.Session, order: StoredOrder, requirePaid = true, mode: StripeMode = "test") {
  const expected = order.snapshot.amounts;
  if (session.livemode !== (mode === "live") || !isStripeSessionId(session.id, mode) || (order.snapshot.mode ?? "test") !== mode || session.currency !== "aed" || session.mode !== "payment"
    || session.metadata?.integration !== stripeIntegration(mode) || session.metadata.tb_protocol !== "2"
    || session.metadata.tb_order_id !== order.id || session.metadata.tb_snapshot_hash !== order.hash
    || (order.sessionId !== null && order.sessionId !== session.id)
    || session.amount_subtotal !== expected.subtotal + expected.shipping || session.amount_total !== expected.total
    || session.total_details?.amount_tax !== expected.vat || session.total_details.amount_discount !== 0 || session.total_details.amount_shipping !== 0
    || (session.shipping_cost?.amount_total ?? 0) !== 0
    || (requirePaid && (session.status !== "complete" || session.payment_status !== "paid"))) throw new Error("PAYMENT_SNAPSHOT_MISMATCH");
}

function verifyLines(order: StoredOrder, lines: Stripe.ApiList<Stripe.LineItem>) {
  if (lines.has_more || lines.data.length !== order.snapshot.lines.length) throw new Error("PAYMENT_LINES_MISMATCH");
  const seen = new Set<number>();
  for (const line of lines.data) {
    const product = line.price?.product;
    if (!product || typeof product === "string" || product.deleted) throw new Error("PAYMENT_LINES_MISMATCH");
    const index = Number(product.metadata.tb_index);
    const expected = order.snapshot.lines[index];
    if (!expected || seen.has(index) || product.metadata.sku !== expected.sku || product.metadata.kind !== expected.kind
      || line.currency !== "aed" || line.quantity !== expected.quantity || line.price?.unit_amount !== expected.unitAmount
      || line.amount_subtotal !== expected.unitAmount * expected.quantity || line.amount_discount !== 0) throw new Error("PAYMENT_LINES_MISMATCH");
    seen.add(index);
    const tax = expected.kind === "samples" ? 0 : Number((BigInt(expected.unitAmount * expected.quantity) * BigInt(500) + BigInt(5000)) / BigInt(10000));
    if (line.amount_tax !== tax || line.amount_total !== line.amount_subtotal + tax
      || (tax > 0 && (line.taxes?.length !== 1 || line.taxes[0].rate.id !== order.snapshot.taxRateId
        || line.taxes[0].rate.percentage !== 5 || line.taxes[0].rate.inclusive || line.taxes[0].rate.livemode !== (order.snapshot.mode === "live")))) throw new Error("PAYMENT_TAX_MISMATCH");
  }
}

export async function processPaidSession(sessionId: string, dependencies: PaidOrderDependencies) {
  const mode = dependencies.mode ?? "test";
  if (!isStripeSessionId(sessionId, mode)) throw new Error("PAYMENT_MODE_MISMATCH");
  const session = await dependencies.retrieveSession(sessionId);
  if (session.id !== sessionId) throw new Error("PAYMENT_SESSION_MISMATCH");
  if (session.metadata?.integration !== stripeIntegration(mode) || session.metadata.tb_protocol !== "2") return { processed: false, ignored: true };
  const order = await dependencies.orders.get(session.metadata.tb_order_id ?? "");
  if (!order) throw new Error("ORDER_SNAPSHOT_MISSING");
  if (session.status !== "complete" || session.payment_status !== "paid") return { processed: false, pending: true };
  verifySessionSnapshot(session, order, true, mode);
  const paymentId = typeof session.payment_intent === "string" ? session.payment_intent : session.payment_intent?.id;
  if (!paymentId || !paymentId.startsWith("pi_")) throw new Error("PAYMENT_INTENT_MISSING");
  const [payment, lines] = await Promise.all([dependencies.retrievePaymentIntent(paymentId), dependencies.listLineItems(session.id)]);
  const charge = payment.latest_charge;
  if (payment.livemode !== (mode === "live") || payment.id !== paymentId || payment.status !== "succeeded" || payment.currency !== "aed"
    || payment.amount !== order.snapshot.amounts.total || payment.amount_received !== order.snapshot.amounts.total
    || payment.metadata.integration !== stripeIntegration(mode) || payment.metadata.tb_protocol !== "2"
    || payment.metadata.tb_order_id !== order.id || payment.metadata.tb_snapshot_hash !== order.hash
    || !charge || typeof charge === "string" || charge.livemode !== (mode === "live") || charge.currency !== "aed"
    || charge.amount !== order.snapshot.amounts.total || !charge.paid || charge.refunded || charge.amount_refunded !== 0 || charge.disputed) throw new Error("PAYMENT_INTENT_MISMATCH");
  verifyLines(order, lines);
  await dependencies.orders.attachSession(order.id, session.id);
  await dependencies.orders.paid(order.id, paymentId);
  if (order.state === "fulfilled") return { processed: true, duplicate: true };
  try {
    const result = await dependencies.createQuotation(order, session, paymentId);
    if (result.total !== order.snapshot.amounts.total) throw new Error("ODOO_TOTAL_MISMATCH");
    await dependencies.orders.fulfilled(order.id, result.id, result.name);
    return { processed: true, duplicate: result.duplicate };
  } catch (error) {
    const code = error instanceof Error && /^(?:ODOO_[A-Z_0-9]+|ORDER_ADDRESS_INVALID)$/.test(error.message) ? error.message : "ODOO_DELIVERY_RETRY_REQUIRED";
    await dependencies.orders.failed(order.id, code);
    throw new Error("ODOO_DELIVERY_RETRY_REQUIRED");
  }
}
