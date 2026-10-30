import type Stripe from "stripe";
import { getCheckoutProductId } from "@/data/catalog";
import { SAMPLE_PRODUCTS } from "@/data/sample-flavours";
import { isShopQuantity, SHOP_MAX_LINES } from "./shop-limits";
import {
  getShopQuote, getShopUnitAmount, isShopCountry,
  type ShopCheckoutKind, type ShopPaymentPricing, type ShopShippingMethod,
} from "@/lib/shop-payment";

export const STRIPE_TEST_STAGING_ORIGIN = "https://the-base-staging.mansua.workers.dev";
export const SHOP_STRIPE_INTEGRATION = "the_base_shop_test";
const MAX_CHECKOUT_BODY_BYTES = 16 * 1024;
const STAGING_HOST = new URL(STRIPE_TEST_STAGING_ORIGIN).hostname;

// Keep existing public product IDs while accepting slugs for the new ranges.
export const STRIPE_TEST_CATALOG = Object.freeze(Object.fromEntries(SAMPLE_PRODUCTS.map(product => [
  getCheckoutProductId(product.slug) ?? product.slug,
  { slug: product.slug, name: product.name, flavors: product.flavours },
])));

export type ShopCustomer = Readonly<{
  name: string; email: string; phone: string;
  businessType?: string; company?: string; website?: string; emirate?: string;
  city?: string; street?: string; postalCode?: string; unit?: string; trn?: string; notes?: string;
}>;
type ValidatedCheckout = Readonly<{
  kind: ShopCheckoutKind; country: string; shippingMethod: ShopShippingMethod;
  customer: ShopCustomer;
  items: readonly Readonly<{ slug: string; name: string; flavor: string; quantity: number }>[];
}>;
export type StripeCheckoutSessionResult = Readonly<{ id: string; url: string | null; livemode: boolean }>;
export type StripeCheckoutClient = Readonly<{
  createSession: (params: Stripe.Checkout.SessionCreateParams, options: Stripe.RequestOptions) => Promise<StripeCheckoutSessionResult>;
}>;
export type StripeCheckoutDependencies = Readonly<{
  secretKey?: string;
  createClient: (secretKey: string) => StripeCheckoutClient;
  createRequestId?: () => string;
  pricing?: ShopPaymentPricing;
}>;

const CUSTOMER_LIMITS = {
  name: 120, email: 254, phone: 40, businessType: 80, company: 160, website: 240,
  emirate: 80, city: 120, street: 240, postalCode: 32, unit: 120, trn: 64, notes: 500,
} as const;
const FORBIDDEN_PRICE_FIELDS = new Set([
  "amount", "amount_total", "price", "priceId", "price_id", "total", "subtotal", "unitAmount", "unit_amount",
  "shipping", "shippingAmount", "shippingFee", "shipping_fee", "tax", "vat", "discount", "discounts",
]);

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function validEmail(value: unknown): value is string {
  return typeof value === "string" && value.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function validateCustomer(input: unknown): ShopCustomer | null {
  if (!isRecord(input)) return null;
  for (const [key, value] of Object.entries(input)) {
    if (!Object.hasOwn(CUSTOMER_LIMITS, key) || typeof value !== "string"
      || value.length > CUSTOMER_LIMITS[key as keyof typeof CUSTOMER_LIMITS] || /[\u0000-\u0008\u000b\u000c\u000e-\u001f]/.test(value)) return null;
  }
  if (typeof input.name !== "string" || !input.name.trim() || !validEmail(input.email)
    || typeof input.phone !== "string" || !/^\+?[\d\s().-]{7,40}$/.test(input.phone)) return null;
  const digits = input.phone.replace(/\D/g, "").length;
  if (digits < 7 || digits > 15) return null;
  return Object.fromEntries(Object.entries(input).map(([key, value]) => [key, (value as string).trim()])) as ShopCustomer;
}

function validateCheckoutPayload(input: unknown): { ok: true; data: ValidatedCheckout } | { ok: false; code: string } {
  if (!isRecord(input)) return { ok: false, code: "INVALID_CHECKOUT_PAYLOAD" };
  if (Object.keys(input).some(key => FORBIDDEN_PRICE_FIELDS.has(key))) return { ok: false, code: "CLIENT_PRICE_FORBIDDEN" };
  if (input.kind !== "products" && input.kind !== "samples") return { ok: false, code: "INVALID_CHECKOUT_KIND" };
  if (typeof input.currency !== "string" || input.currency.toLowerCase() !== "aed") return { ok: false, code: "UNSUPPORTED_CURRENCY" };
  if (typeof input.country !== "string" || !isShopCountry(input.country)) return { ok: false, code: "INVALID_COUNTRY" };
  if (input.shippingMethod !== "standard" && input.shippingMethod !== "express") return { ok: false, code: "INVALID_SHIPPING_METHOD" };
  const customer = validateCustomer(input.customer);
  if (!customer) return { ok: false, code: "INVALID_CUSTOMER" };
  if (input.email !== undefined && (!validEmail(input.email) || input.email !== customer.email)) return { ok: false, code: "INVALID_EMAIL" };
  if (!Array.isArray(input.items) || !input.items.length || input.items.length > SHOP_MAX_LINES) return { ok: false, code: "INVALID_ITEMS" };

  const seen = new Set<string>();
  const items: ValidatedCheckout["items"][number][] = [];
  for (const item of input.items) {
    if (!isRecord(item)) return { ok: false, code: "INVALID_ITEM" };
    if (Object.keys(item).some(key => FORBIDDEN_PRICE_FIELDS.has(key))) return { ok: false, code: "CLIENT_PRICE_FORBIDDEN" };
    if (typeof item.productId !== "string") return { ok: false, code: "INVALID_PRODUCT" };
    const slug = Object.hasOwn(STRIPE_TEST_CATALOG, item.productId) ? STRIPE_TEST_CATALOG[item.productId].slug : item.productId;
    const product = SAMPLE_PRODUCTS.find(product => product.slug === slug);
    if (!product) return { ok: false, code: "INVALID_PRODUCT" };
    if (typeof item.flavor !== "string" || !product.flavours.includes(item.flavor)) return { ok: false, code: "INVALID_FLAVOR" };
    const key = JSON.stringify([product.slug, item.flavor]);
    if (seen.has(key)) return { ok: false, code: "DUPLICATE_LINE" };
    if (!isShopQuantity(item.quantity)) return { ok: false, code: "INVALID_QUANTITY" };
    seen.add(key);
    items.push({ slug: product.slug, name: product.name, flavor: item.flavor, quantity: item.quantity });
  }
  return { ok: true, data: { kind: input.kind, country: input.country, shippingMethod: input.shippingMethod, customer, items } };
}

export function isAllowedStripeTestHost(hostname: string) {
  return [STAGING_HOST, "localhost", "127.0.0.1", "[::1]"].includes(hostname);
}

export function isStripeTestKey(secretKey: string | undefined) {
  return /^(?:sk|rk)_test_/.test(secretKey?.trim() ?? "");
}

export function stripeApiError(status: number, code: string, message: string) {
  return Response.json({ ok: false, error: { code, message } }, { status, headers: { "Cache-Control": "no-store" } });
}

function validCheckoutUrl(value: string | null) {
  if (!value) return false;
  try {
    const url = new URL(value);
    return url.protocol === "https:" && url.host === "checkout.stripe.com" && !url.username && !url.password;
  } catch { return false; }
}

export async function handleStripeTestCheckout(request: Request, dependencies: StripeCheckoutDependencies) {
  const url = new URL(request.url);
  if (!isAllowedStripeTestHost(url.hostname)) return stripeApiError(403, "STRIPE_TEST_HOST_REQUIRED", "Secure Test checkout is only available on staging and local development.");
  const origin = request.headers.get("origin");
  if (origin && origin !== url.origin) return stripeApiError(403, "CHECKOUT_ORIGIN_REJECTED", "The checkout request origin is invalid.");
  if (!request.headers.get("content-type")?.toLowerCase().startsWith("application/json")) return stripeApiError(415, "INVALID_CONTENT_TYPE", "The checkout request must be JSON.");
  const declaredLength = Number(request.headers.get("content-length") ?? "0");
  if (declaredLength > MAX_CHECKOUT_BODY_BYTES) return stripeApiError(413, "PAYLOAD_TOO_LARGE", "The request body is too large.");
  let input: unknown;
  try {
    const body = await request.text();
    if (new TextEncoder().encode(body).byteLength > MAX_CHECKOUT_BODY_BYTES) return stripeApiError(413, "PAYLOAD_TOO_LARGE", "The request body is too large.");
    input = JSON.parse(body);
  } catch { return stripeApiError(400, "INVALID_JSON", "The request body must be valid JSON."); }
  const validation = validateCheckoutPayload(input);
  if (!validation.ok) return stripeApiError(422, validation.code, "Please review the checkout details.");
  const data = validation.data;
  const quote = getShopQuote(data, dependencies.pricing);
  if (!quote.ready) return stripeApiError(503, "CHECKOUT_PRICING_NOT_CONFIGURED", quote.reason ?? "Prices and delivery need to be confirmed before payment.");
  const secretKey = dependencies.secretKey?.trim();
  if (!secretKey) return stripeApiError(503, "STRIPE_TEST_NOT_CONFIGURED", "Secure Test checkout is not configured.");
  if (!isStripeTestKey(secretKey)) return stripeApiError(503, "STRIPE_TEST_KEY_REQUIRED", "Only a Stripe Test Mode secret key is accepted.");

  const requestId = `tb_test_${dependencies.createRequestId?.() ?? crypto.randomUUID()}`;
  const metadata = { tb_request_id: requestId, integration: SHOP_STRIPE_INTEGRATION,
    kind: data.kind, country: data.country, shipping_method: data.shippingMethod,
    tb_subtotal: String(quote.subtotal), tb_shipping: String(quote.shipping), tb_total: String(quote.total) };
  const { customer } = data;
  const shipping: Stripe.Checkout.SessionCreateParams.PaymentIntentData.Shipping | undefined = customer.street && customer.city ? {
    name: customer.name, phone: customer.phone,
    address: { country: data.country, city: customer.city, line1: customer.street, line2: customer.unit,
      state: customer.emirate, postal_code: customer.postalCode },
  } : undefined;
  const params: Stripe.Checkout.SessionCreateParams = {
    mode: "payment", payment_method_types: ["card"],
    line_items: data.items.map(item => ({ quantity: item.quantity, price_data: {
      currency: "aed", unit_amount: data.kind === "samples" ? 0 : getShopUnitAmount(item.slug, dependencies.pricing)!,
      product_data: { name: `${item.name} — ${item.flavor}${data.kind === "samples" ? " (sample)" : ""}`,
        metadata: { slug: item.slug, flavor: item.flavor, kind: data.kind } },
    } })),
    shipping_options: [{ shipping_rate_data: { type: "fixed_amount", display_name: data.shippingMethod === "express" ? "Express delivery" : "Standard delivery",
      fixed_amount: { amount: quote.shipping!, currency: "aed" } } }],
    shipping_address_collection: { allowed_countries: [data.country as Stripe.Checkout.SessionCreateParams.ShippingAddressCollection.AllowedCountry] },
    billing_address_collection: "required", phone_number_collection: { enabled: true },
    customer_email: customer.email,
    success_url: `${url.origin}/checkout?session_id={CHECKOUT_SESSION_ID}&country=${data.country}&kind=${data.kind}`,
    cancel_url: `${url.origin}/checkout?stripe_checkout=cancelled&country=${data.country}&kind=${data.kind}`,
    metadata: { ...metadata, company: customer.company ?? "", trn: customer.trn ?? "", notes: customer.notes ?? "",
      business_type: customer.businessType ?? "", website: customer.website ?? "" },
    payment_intent_data: { metadata, shipping },
  };
  try {
    const session = await dependencies.createClient(secretKey).createSession(params, { idempotencyKey: requestId });
    if (session.livemode || !session.id.startsWith("cs_test_") || !validCheckoutUrl(session.url)) return stripeApiError(502, "STRIPE_TEST_SESSION_REJECTED", "Stripe did not return a valid Test Mode checkout.");
    return Response.json({ ok: true, checkout: { sessionId: session.id, url: session.url, requestId, currency: "AED", testMode: true } },
      { status: 201, headers: { "Cache-Control": "no-store" } });
  } catch { return stripeApiError(502, "STRIPE_TEST_UNAVAILABLE", "Secure Test checkout is temporarily unavailable."); }
}
