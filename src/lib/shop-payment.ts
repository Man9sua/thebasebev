import { SAMPLE_PRODUCTS } from "@/data/sample-flavours";
import { DISTRIBUTOR_MARKETS } from "@/data/distributor-markets";

export type ShopCheckoutKind = "products" | "samples";
export type ShopShippingMethod = "standard" | "express";
export type ShopPaymentItem = Readonly<{ slug: string; flavor: string; quantity: number }>;
export type ShopQuoteInput = Readonly<{
  kind: ShopCheckoutKind;
  country: string;
  shippingMethod: ShopShippingMethod;
  items: readonly ShopPaymentItem[];
}>;
export type ShopQuote = Readonly<{
  ready: boolean;
  subtotal: number | null;
  shipping: number | null;
  total: number | null;
  reason: string | null;
  currency: "aed";
}>;
type ShopShippingRates = Readonly<Partial<Record<ShopShippingMethod, number | null>>>;
export type ShopPaymentPricing = Readonly<{
  productUnitAmounts: Readonly<Record<string, number | null>>;
  shipping: Readonly<Partial<Record<ShopCheckoutKind, Readonly<Record<string, ShopShippingRates>>>>>;
}>;

// The HTML amounts are design examples, and the old Tilda prices have not
// been approved for this shop. Unknown amounts must never become free orders.
export const SHOP_PAYMENT_PRICING: ShopPaymentPricing = Object.freeze({
  productUnitAmounts: Object.freeze(Object.fromEntries(SAMPLE_PRODUCTS.map(({ slug }) => [slug, null]))),
  shipping: Object.freeze({}),
});

const formatter = new Intl.NumberFormat("en-AE", { style: "currency", currency: "AED", currencyDisplay: "code" });
const countries = new Set(DISTRIBUTOR_MARKETS.map(({ code }) => code));

export function isShopCountry(country: string) {
  return countries.has(country);
}

function validAmount(value: unknown): value is number {
  return typeof value === "number" && Number.isSafeInteger(value) && value >= 0;
}

export function getShopUnitAmount(slug: string, pricing: ShopPaymentPricing = SHOP_PAYMENT_PRICING): number | null {
  const value = pricing.productUnitAmounts[slug];
  return validAmount(value) && value > 0 ? value : null;
}

export function formatShopMoney(minor: number): string {
  return formatter.format(minor / 100);
}

export function getShopQuote(input: ShopQuoteInput, pricing: ShopPaymentPricing = SHOP_PAYMENT_PRICING): ShopQuote {
  const pending = (reason: string, subtotal: number | null = null): ShopQuote =>
    ({ ready: false, subtotal, shipping: null, total: null, reason, currency: "aed" });
  if (!isShopCountry(input.country) || !["products", "samples"].includes(input.kind)
    || !["standard", "express"].includes(input.shippingMethod)) return pending("Delivery is not available for this selection.");
  if (!input.items.length || input.items.length > (input.kind === "samples" ? 6 : 20)) return pending("Please review the items in your bag.");

  let subtotal = 0;
  const seen = new Set<string>();
  for (const item of input.items) {
    const product = SAMPLE_PRODUCTS.find(({ slug }) => slug === item.slug);
    const key = JSON.stringify([item.slug, item.flavor]);
    if (!product?.flavours.includes(item.flavor) || seen.has(key) || !Number.isInteger(item.quantity)
      || item.quantity < 1 || item.quantity > (input.kind === "samples" ? 1 : 10)) return pending("Please review the items in your bag.");
    seen.add(key);
    if (input.kind === "samples") continue;
    const amount = getShopUnitAmount(item.slug, pricing);
    if (amount === null) return pending("Product prices are being confirmed. Please contact us for a quote.");
    subtotal += amount * item.quantity;
    if (!Number.isSafeInteger(subtotal)) return pending("Please contact us for this order.");
  }

  const shipping = pricing.shipping[input.kind]?.[input.country]?.[input.shippingMethod];
  if (!validAmount(shipping) || (input.kind === "samples" && shipping === 0)) {
    return pending("The delivery charge needs to be confirmed before payment.", subtotal);
  }
  const total = subtotal + shipping;
  if (!Number.isSafeInteger(total) || total <= 0) return pending("Please contact us for this order.", subtotal);
  return { ready: true, subtotal, shipping, total, reason: null, currency: "aed" };
}
