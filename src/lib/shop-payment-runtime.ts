import { getCloudflareContext } from "@opennextjs/cloudflare";
import { createOrderStore, type OrderDatabase } from "./shop-order-store";
import { isStripeKey, validLiveOrigin, type StripeMode } from "./stripe-mode";
import mapping from "@/data/shop-odoo.json";

export function resolveShopPaymentRuntime(environment: Record<string, unknown>) {
  const value = (name: string) => typeof environment[name] === "string" ? environment[name] as string : undefined;
  const mode: StripeMode = value("SHOP_PAYMENTS_ENABLED") === "live" ? "live" : "test";
  const live = mode === "live";
  const liveOrigin = validLiveOrigin(value("SHOP_LIVE_ORIGIN"));
  const database = environment.SHOP_ORDERS as OrderDatabase | undefined;
  const secretKey = live ? value("STRIPE_LIVE_RESTRICTED_KEY") ?? value("STRIPE_LIVE_SECRET_KEY") : value("STRIPE_SECRET_KEY");
  const taxRateId = value(live ? "STRIPE_LIVE_UAE_VAT_RATE_ID" : "STRIPE_UAE_VAT_RATE_ID");
  const webhookSecret = value(live ? "STRIPE_LIVE_WEBHOOK_SECRET" : "STRIPE_WEBHOOK_SECRET");
  const liveActionId = Number(value("ODOO_LIVE_ACTION_ID"));
  const modeReady = live ? value("APP_ENV") === "production" && liveOrigin && Number.isSafeInteger(liveActionId) && liveActionId > 0 && liveActionId !== mapping.actionId
    : value("SHOP_PAYMENTS_ENABLED") === "test";
  return { orders: database ? createOrderStore(database) : undefined,
    mode, liveOrigin, secretKey, taxRateId, webhookSecret,
    receiverReady: Boolean(modeReady && isStripeKey(secretKey, mode) && database && value("ODOO_URL") && value("ODOO_API_KEY") && webhookSecret && taxRateId),
    odoo: { url: value("ODOO_URL") ?? "", apiKey: value("ODOO_API_KEY") ?? "", database: value("ODOO_DATABASE"), ...(live ? { actionId: liveActionId } : {}) } };
}

export async function getShopPaymentRuntime() {
  let environment: Record<string, unknown> = process.env;
  try { environment = (await getCloudflareContext({ async: true })).env as unknown as Record<string, unknown>; } catch { /* Node-only checks have no Worker bindings. */ }
  return resolveShopPaymentRuntime(environment);
}
