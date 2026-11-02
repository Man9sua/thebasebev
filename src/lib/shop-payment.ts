import { SAMPLE_PRODUCTS } from "@/data/sample-flavours";
import { DISTRIBUTOR_MARKETS } from "@/data/distributor-markets";
import { isShopQuantity, SHOP_MAX_LINES } from "./shop-limits";
import priceList from "@/data/shop-prices.json";
import availability from "@/data/shop-payment-availability.json";

export type ShopCheckoutKind = "products" | "samples";
export type ShopShippingMethod = "standard" | "express";
export type ShopPaymentItem = Readonly<{ slug: string; flavor: string; quantity: number; kind?: ShopCheckoutKind }>;
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
  vat: number | null;
  total: number | null;
  reason: string | null;
  currency: "aed";
}>;
type ShopShippingRates = Readonly<Partial<Record<ShopShippingMethod, number | null>>>;
export type ShopPaymentPricing = Readonly<{
  productUnitAmounts: Readonly<Record<string, number | null>>;
  shipping: Readonly<Partial<Record<ShopCheckoutKind, Readonly<Record<string, ShopShippingRates>>>>>;
  variants?: readonly ShopVariantPrice[];
  vatRateBps?: number;
  uaeDelivery?: Readonly<{ amount: number; freeFromSubtotal: number; maxSampleWeightGrams: number }>;
}>;

type ShopVariantPrice = Readonly<{
  slug: string; flavor: string; sku: string; unitAmount: number;
  packGrams: number | null; sampleWeightGrams: number | null;
}>;

// The owner supplied these AED prices and confirmed VAT is additional.
// Unmatched variants keep the quotation path; never borrow another flavour's price.
export const SHOP_PAYMENT_PRICING: ShopPaymentPricing = Object.freeze({
  productUnitAmounts: Object.freeze({}),
  shipping: Object.freeze({}),
  variants: priceList.records,
  vatRateBps: 500,
  uaeDelivery: Object.freeze({ amount: 3000, freeFromSubtotal: 50_000, maxSampleWeightGrams: 5000 }),
});

// The server also requires its Test Mode secrets, ledger binding and receiver flag.
export const SHOP_ORDER_PAYMENTS_READY = true;
export const UAE_DELIVERY_TIMING = "Orders placed on weekdays are delivered the next day. Weekend orders are delivered in 1–2 days.";

const variantsByKey = new Map(priceList.records.map(item => [`${item.slug}::${item.flavor}`, item]));
const rangesBySlug = new Map<string, { min: number; max: number }>();
for (const item of priceList.records) {
  const range = rangesBySlug.get(item.slug);
  rangesBySlug.set(item.slug, { min: Math.min(range?.min ?? item.unitAmount, item.unitAmount), max: Math.max(range?.max ?? item.unitAmount, item.unitAmount) });
}
const VAT_SCALE = BigInt(10_000);
const VAT_HALF_SCALE = BigInt(5000);
const payableVariants = new Map(availability.map(row => [`${row.slug}::${row.flavor}`, row]));

export function hasPayableVariants(kind: ShopCheckoutKind, items: readonly ShopPaymentItem[]) {
  return items.length > 0 && items.every(item => payableVariants.get(`${item.slug}::${item.flavor}`)?.[shopItemKind(kind, item)] === true);
}

function variantFor(slug: string, flavor: string, pricing: ShopPaymentPricing) {
  return pricing === SHOP_PAYMENT_PRICING ? variantsByKey.get(`${slug}::${flavor}`)
    : pricing.variants?.find(item => item.slug === slug && item.flavor === flavor);
}

const formatter = new Intl.NumberFormat("en-AE", { style: "currency", currency: "AED", currencyDisplay: "code" });
const countries = new Set(DISTRIBUTOR_MARKETS.map(({ code }) => code));

export function isShopCountry(country: string) {
  return countries.has(country);
}

function validAmount(value: unknown): value is number {
  return typeof value === "number" && Number.isSafeInteger(value) && value >= 0;
}

export function getShopUnitAmount(slug: string, pricing: ShopPaymentPricing = SHOP_PAYMENT_PRICING, flavor?: string): number | null {
  const variant = flavor ? variantFor(slug, flavor, pricing) : undefined;
  const value = variant?.unitAmount ?? pricing.productUnitAmounts[slug];
  return validAmount(value) && value > 0 ? value : null;
}

export function getShopPriceRange(slug: string) {
  return rangesBySlug.get(slug) ?? null;
}

export function shopItemKind(kind: ShopCheckoutKind, item: ShopPaymentItem): ShopCheckoutKind {
  return item.kind ?? kind;
}

export function getShopPackLabel(slug: string, flavor: string) {
  const item = variantsByKey.get(`${slug}::${flavor}`);
  return item?.sku.includes("dp100") ? "100 × 1 g sachets" : item?.packGrams ? `${item.packGrams} g pouch` : null;
}

export function formatShopMoney(minor: number): string {
  return formatter.format(minor / 100);
}

export function getShopQuote(input: ShopQuoteInput, pricing: ShopPaymentPricing = SHOP_PAYMENT_PRICING): ShopQuote {
  const pending = (reason: string, subtotal: number | null = null): ShopQuote =>
    ({ ready: false, subtotal, shipping: null, vat: null, total: null, reason, currency: "aed" });
  if (!isShopCountry(input.country) || !["products", "samples"].includes(input.kind)
    || !["standard", "express"].includes(input.shippingMethod)) return pending("Delivery is not available for this selection.");
  if (!input.items.length || input.items.length > SHOP_MAX_LINES) return pending("Please review the items in your bag.");

  let subtotal = 0;
  const lineAmounts: number[] = [];
  const seen = new Set<string>();
  for (const item of input.items) {
    const product = SAMPLE_PRODUCTS.find(({ slug }) => slug === item.slug);
    const lineKind = shopItemKind(input.kind, item);
    const key = JSON.stringify([lineKind, item.slug, item.flavor]);
    if (!["products", "samples"].includes(lineKind) || (input.kind === "samples" && lineKind !== "samples")) return pending("Please review the items in your bag.");
    if (!product?.flavours.includes(item.flavor) || seen.has(key) || !isShopQuantity(item.quantity)) return pending("Please review the items in your bag.");
    seen.add(key);
    if (lineKind === "samples") continue;
    const amount = getShopUnitAmount(item.slug, pricing, item.flavor);
    if (amount === null) return pending("Product prices are being confirmed. Please contact us for a quote.");
    subtotal += amount * item.quantity;
    lineAmounts.push(amount * item.quantity);
    if (!Number.isSafeInteger(subtotal)) return pending("Please contact us for this order.");
  }

  const sampleOnly = input.items.every(item => shopItemKind(input.kind, item) === "samples");
  let shipping = pricing.shipping[sampleOnly ? "samples" : "products"]?.[input.country]?.[input.shippingMethod];
  if (input.country === "AE" && pricing.uaeDelivery && input.shippingMethod === "standard") {
    if (sampleOnly) {
      let weight = 0;
      for (const item of input.items) {
        const grams = variantFor(item.slug, item.flavor, pricing)?.sampleWeightGrams;
        if (!grams || !Number.isSafeInteger(grams) || grams < 0) return pending("We will confirm the sample parcel weight and delivery charge.", subtotal);
        weight += grams * item.quantity;
      }
      if (weight > pricing.uaeDelivery.maxSampleWeightGrams) return pending("Sample parcels over 5 kg need a delivery quote.", subtotal);
    }
    shipping = !sampleOnly && subtotal >= pricing.uaeDelivery.freeFromSubtotal ? 0 : pricing.uaeDelivery.amount;
  }
  if (!validAmount(shipping) || (sampleOnly && shipping === 0)) {
    return pending("The delivery charge needs to be confirmed before payment.", subtotal);
  }
  const rate = pricing.vatRateBps ?? 0;
  if (!Number.isSafeInteger(rate) || rate < 0 || rate > 10_000) return pending("Tax needs to be confirmed before payment.", subtotal);
  // Round once per order line, plus delivery, using exact minor-unit arithmetic.
  const vatRate = BigInt(rate);
  const vat = [...lineAmounts, shipping].reduce((sum, amount) => sum + Number((BigInt(amount) * vatRate + VAT_HALF_SCALE) / VAT_SCALE), 0);
  const total = subtotal + shipping + vat;
  if (!Number.isSafeInteger(total) || total <= 0) return pending("Please contact us for this order.", subtotal);
  return { ready: true, subtotal, shipping, vat, total, reason: null, currency: "aed" };
}
