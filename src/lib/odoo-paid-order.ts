import type Stripe from "stripe";
import { sha256, type StoredOrder } from "./shop-order";
import mapping from "@/data/shop-odoo.json";

export type OdooPaymentConfig = { url: string; apiKey: string; database?: string; actionId?: number };
export type QuotationResult = { id: number; name: string; state: string; total: number; duplicate: boolean };
const escape = (value: string) => value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#39;");

export async function createPaidQuotation(order: StoredOrder, session: Stripe.Checkout.Session, paymentIntent: string, config: OdooPaymentConfig): Promise<QuotationResult> {
  if (new URL(config.url).origin !== "https://odoo.thebasebev.com" || !config.apiKey) throw new Error("ODOO_NOT_CONFIGURED");
  const testMode = order.snapshot.mode !== "live";
  const actionId = testMode ? mapping.actionId : config.actionId;
  if (!Number.isSafeInteger(actionId) || !actionId || actionId <= 0 || (!testMode && actionId === mapping.actionId)
    || session.livemode !== !testMode || !session.id.startsWith(testMode ? "cs_test_" : "cs_live_")) throw new Error("ODOO_RECEIVER_MODE_MISMATCH");
  const shipping = session.collected_information?.shipping_details;
  const billing = session.customer_details?.address;
  if (!shipping?.address || !billing?.line1 || shipping.address.country !== "AE" || !billing.country) throw new Error("ORDER_ADDRESS_INVALID");
  const payload = { test_mode: testMode, session_id: session.id, payment_intent: paymentIntent, snapshot_hash: order.hash,
    lock_key: Number.parseInt((await sha256(session.id)).slice(0, 13), 16), currency: "AED", amounts: order.snapshot.amounts,
    buyer: order.snapshot.customer, billing, shipping: { ...shipping.address, name: shipping.name },
    attribution_note: escape(JSON.stringify(order.snapshot.attribution ?? {})), customer_note: escape(order.snapshot.customer.notes ?? ""),
    lines: order.snapshot.lines.map(line => ({ product_id: line.productId, sku: line.sku, name: line.name, kind: line.kind, quantity: line.quantity, unit_amount: line.unitAmount })) };
  const response = await fetch(new URL("/json/2/ir.actions.server/run", config.url), {
    method: "POST", headers: { Authorization: `bearer ${config.apiKey}`, "Content-Type": "application/json",
      ...(config.database ? { "X-Odoo-Database": config.database } : {}) },
    body: JSON.stringify({ ids: [actionId], context: { allowed_company_ids: [mapping.companyId], tb_stripe_order: payload } }),
    signal: AbortSignal.timeout(25_000), redirect: "manual",
  });
  if (!response.ok) throw new Error(`ODOO_HTTP_${response.status}`);
  const result = await response.json();
  if (result?.res_model !== "sale.order" || !Number.isSafeInteger(result.res_id) || result.res_id <= 0
    || typeof result.tb_name !== "string" || result.tb_total !== order.snapshot.amounts.total
    || (!result.tb_duplicate && result.tb_state !== "draft")) throw new Error("ODOO_QUOTATION_INVALID");
  return { id: result.res_id, name: result.tb_name, state: result.tb_state, total: result.tb_total, duplicate: result.tb_duplicate === true };
}
