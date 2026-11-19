import type { ShopCustomer } from "./stripe-checkout";
import type { StripeMode } from "./stripe-mode";
import { getShopQuote, getShopUnitAmount, shopItemKind, type ShopPaymentPricing, type ShopQuoteInput } from "./shop-payment";
import mapping from "@/data/shop-odoo.json";
import { SAMPLE_PRODUCTS } from "@/data/sample-flavours";
import type { FirstTouchAttribution } from "./leads";

export type OrderLine = Readonly<{
  slug: string; flavor: string; name: string; kind: "products" | "samples" | "delivery";
  sku: string; productId: number; quantity: number; unitAmount: number;
}>;
export type OrderSnapshot = Readonly<{
  version: 2; mode?: StripeMode; kind: "products" | "samples"; country: string; shippingMethod: string;
  customer: ShopCustomer; taxRateId: string;
  consent: true;
  attribution?: FirstTouchAttribution & { currentPage: string };
  amounts: Readonly<{ subtotal: number; shipping: number; vat: number; total: number }>;
  lines: readonly OrderLine[];
}>;
export type StoredOrder = Readonly<{
  id: string; checkoutKey: string; hash: string; snapshot: OrderSnapshot;
  sessionId: string | null; state: "pending" | "paid" | "fulfilled" | "expired";
  paymentIntent: string | null; odooOrderId: number | null; odooOrderName: string | null;
  createdAt: number;
}>;
export interface OrderStore {
  reserve(key: string, snapshot: OrderSnapshot): Promise<StoredOrder>;
  get(id: string): Promise<StoredOrder | null>;
  bySession(sessionId: string): Promise<StoredOrder | null>;
  attachSession(id: string, sessionId: string): Promise<void>;
  paid(id: string, paymentIntent: string): Promise<void>;
  fulfilled(id: string, orderId: number, orderName: string): Promise<void>;
  failed(id: string, code: string): Promise<void>;
}

const variants = new Map(mapping.records.map(row => [`${row.slug}::${row.flavor}`, row]));
const names = new Map(SAMPLE_PRODUCTS.map(row => [row.slug, row.name]));

export function prepareOrderSnapshot(input: ShopQuoteInput & { customer: ShopCustomer; attribution?: OrderSnapshot["attribution"] }, taxRateId: string, pricing?: ShopPaymentPricing, mode: StripeMode = "test"): OrderSnapshot {
  const quote = getShopQuote(input, pricing);
  if (!quote.ready || input.country !== "AE" || !/^txr_[a-zA-Z0-9]+$/.test(taxRateId)) throw new Error("ORDER_NOT_PAYABLE");
  const lines: OrderLine[] = input.items.map(item => {
    const kind = shopItemKind(input.kind, item);
    const variant = variants.get(`${item.slug}::${item.flavor}`)?.[kind];
    if (!variant) throw new Error("ODOO_VARIANT_UNRESOLVED");
    return { ...item, kind, name: `${names.get(item.slug)} — ${item.flavor}${kind === "samples" ? " (free sample)" : ""}`,
      sku: variant.sku, productId: variant.id, unitAmount: kind === "samples" ? 0 : getShopUnitAmount(item.slug, pricing, item.flavor)! };
  });
  if (quote.shipping! > 0) lines.push({ slug: "delivery", flavor: "UAE standard delivery", kind: "delivery", name: "UAE delivery",
    sku: mapping.delivery.sku, productId: mapping.delivery.id, quantity: 1, unitAmount: quote.shipping! });
  if (lines.length > 100 || quote.total! > 99_999_999) throw new Error("ORDER_NEEDS_QUOTE");
  return { version: 2, mode, kind: input.kind, country: input.country, shippingMethod: input.shippingMethod, customer: input.customer, taxRateId, consent: true,
    ...(input.attribution ? { attribution: input.attribution } : {}),
    amounts: { subtotal: quote.subtotal!, shipping: quote.shipping!, vat: quote.vat!, total: quote.total! }, lines };
}

export async function sha256(value: string) {
  const bytes = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
  return Array.from(new Uint8Array(bytes), byte => byte.toString(16).padStart(2, "0")).join("");
}

function canonical(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(canonical);
  if (value && typeof value === "object") return Object.fromEntries(Object.entries(value).sort(([a], [b]) => a.localeCompare(b)).map(([key, item]) => [key, canonical(item)]));
  return value;
}
export function snapshotHash(snapshot: OrderSnapshot) {
  return sha256(JSON.stringify(canonical(snapshot)));
}
