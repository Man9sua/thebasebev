import { getCloudflareContext } from "@opennextjs/cloudflare";
import { createOrderStore, type OrderDatabase } from "./shop-order-store";

export async function getShopPaymentRuntime() {
  let database: OrderDatabase | undefined;
  try { database = ((await getCloudflareContext({ async: true })).env as unknown as { SHOP_ORDERS?: OrderDatabase }).SHOP_ORDERS; } catch { /* Node-only checks have no Worker bindings. */ }
  return { orders: database ? createOrderStore(database) : undefined,
    secretKey: process.env.STRIPE_SECRET_KEY, taxRateId: process.env.STRIPE_UAE_VAT_RATE_ID,
    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
    receiverReady: process.env.SHOP_PAYMENTS_ENABLED === "test" && Boolean(database && process.env.ODOO_API_KEY && process.env.STRIPE_WEBHOOK_SECRET && process.env.STRIPE_UAE_VAT_RATE_ID),
    odoo: { url: process.env.ODOO_URL ?? "", apiKey: process.env.ODOO_API_KEY ?? "", database: process.env.ODOO_DATABASE } };
}
