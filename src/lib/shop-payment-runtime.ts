import { getCloudflareContext } from "@opennextjs/cloudflare";
import { createOrderStore, type OrderDatabase } from "./shop-order-store";

export async function getShopPaymentRuntime() {
  let environment: Record<string, unknown> = process.env;
  try { environment = (await getCloudflareContext({ async: true })).env as unknown as Record<string, unknown>; } catch { /* Node-only checks have no Worker bindings. */ }
  const value = (name: string) => typeof environment[name] === "string" ? environment[name] as string : undefined;
  const database = environment.SHOP_ORDERS as OrderDatabase | undefined;
  return { orders: database ? createOrderStore(database) : undefined,
    secretKey: value("STRIPE_SECRET_KEY"), taxRateId: value("STRIPE_UAE_VAT_RATE_ID"), webhookSecret: value("STRIPE_WEBHOOK_SECRET"),
    receiverReady: value("SHOP_PAYMENTS_ENABLED") === "test" && Boolean(database && value("ODOO_URL") && value("ODOO_API_KEY") && value("STRIPE_WEBHOOK_SECRET") && value("STRIPE_UAE_VAT_RATE_ID")),
    odoo: { url: value("ODOO_URL") ?? "", apiKey: value("ODOO_API_KEY") ?? "", database: value("ODOO_DATABASE") } };
}
