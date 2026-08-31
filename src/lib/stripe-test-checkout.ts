import type Stripe from "stripe";
import { COMMERCE_CATALOG, type CommerceCatalogProduct } from "./commerce/catalog";
import { getCommerceCheckoutConfiguration } from "./commerce/config";
import type { CommerceOrder, CommerceRepository } from "./commerce/types";

export const STRIPE_TEST_STAGING_ORIGIN =
  "https://the-base-staging.mansua.workers.dev";

const MAX_LINE_ITEMS = 20;
const MAX_QUANTITY_PER_ITEM = 100;
const MAX_CHECKOUT_BODY_BYTES = 16 * 1024;

// Test-only, server-authoritative snapshot of the prices preserved from the
// audited Tilda export. The API never accepts an amount supplied by a client.
export const STRIPE_TEST_CATALOG = COMMERCE_CATALOG;

type CatalogProductId = string;

type ValidatedCheckout = Readonly<{
  currency: "aed";
  email?: string;
  items: ReadonlyArray<
    Readonly<{
      productId: CatalogProductId;
      quantity: number;
      product: CommerceCatalogProduct;
    }>
  >;
}>;

type CheckoutValidation =
  | { ok: true; data: ValidatedCheckout }
  | { ok: false; code: string };

export type StripeCheckoutSessionResult = Readonly<{
  id: string;
  url: string | null;
  livemode: boolean;
}>;

export type StripeCheckoutClient = Readonly<{
  createSession: (
    params: Stripe.Checkout.SessionCreateParams,
    options: Stripe.RequestOptions,
  ) => Promise<StripeCheckoutSessionResult>;
}>;

export type StripeCheckoutDependencies = Readonly<{
  secretKey?: string;
  createClient: (secretKey: string) => StripeCheckoutClient;
  repository: CommerceRepository;
  environment?: Record<string, string | undefined>;
  createRequestId?: () => string;
  now?: () => Date;
}>;

const FORBIDDEN_CLIENT_PRICE_FIELDS = new Set([
  "amount",
  "amount_total",
  "price",
  "priceId",
  "price_id",
  "total",
  "unitAmount",
  "unit_amount",
]);

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function validateCheckoutPayload(input: unknown): CheckoutValidation {
  if (!isRecord(input)) {
    return { ok: false, code: "INVALID_CHECKOUT_PAYLOAD" };
  }

  if (Object.keys(input).some((key) => FORBIDDEN_CLIENT_PRICE_FIELDS.has(key))) {
    return { ok: false, code: "CLIENT_PRICE_FORBIDDEN" };
  }

  const currency =
    typeof input.currency === "string" ? input.currency.toLowerCase() : "";
  if (currency !== "aed") {
    return { ok: false, code: "UNSUPPORTED_CURRENCY" };
  }

  if (
    !Array.isArray(input.items) ||
    input.items.length === 0 ||
    input.items.length > MAX_LINE_ITEMS
  ) {
    return { ok: false, code: "INVALID_ITEMS" };
  }

  const email = typeof input.email === "string" ? input.email.trim() : undefined;
  if (
    email !== undefined &&
    (email.length < 3 || email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
  ) {
    return { ok: false, code: "INVALID_EMAIL" };
  }

  const seenProductIds = new Set<string>();
  const items: ValidatedCheckout["items"][number][] = [];

  for (const item of input.items) {
    if (!isRecord(item)) {
      return { ok: false, code: "INVALID_ITEM" };
    }

    if (Object.keys(item).some((key) => FORBIDDEN_CLIENT_PRICE_FIELDS.has(key))) {
      return { ok: false, code: "CLIENT_PRICE_FORBIDDEN" };
    }

    const productId = item.productId;
    if (
      typeof productId !== "string" ||
      !Object.hasOwn(COMMERCE_CATALOG, productId)
    ) {
      return { ok: false, code: "INVALID_PRODUCT" };
    }

    if (seenProductIds.has(productId)) {
      return { ok: false, code: "DUPLICATE_PRODUCT" };
    }

    const quantity = item.quantity;
    if (
      typeof quantity !== "number" ||
      !Number.isInteger(quantity) ||
      quantity < 1 ||
      quantity > MAX_QUANTITY_PER_ITEM
    ) {
      return { ok: false, code: "INVALID_QUANTITY" };
    }

    const typedProductId = productId;
    seenProductIds.add(productId);
    items.push({
      productId: typedProductId,
      quantity,
      product: COMMERCE_CATALOG[typedProductId],
    });
  }

  return { ok: true, data: { currency: "aed", email, items } };
}

function stripeSecretMode(secretKey: string | undefined) {
  const key = secretKey?.trim() ?? "";
  if (!key) return "missing" as const;
  if (key.startsWith("sk_live_") || key.startsWith("rk_live_")) {
    return "live" as const;
  }
  if (key.startsWith("sk_test_") || key.startsWith("rk_test_")) {
    return "test" as const;
  }
  return "unknown" as const;
}

function isAllowedTestHost(hostname: string) {
  return (
    hostname === "the-base-staging.mansua.workers.dev" ||
    hostname === "localhost" ||
    hostname === "127.0.0.1" ||
    hostname === "[::1]"
  );
}

function apiError(status: number, code: string, message: string) {
  return Response.json(
    { ok: false, error: { code, message } },
    { status, headers: { "Cache-Control": "no-store" } },
  );
}

export async function handleStripeTestCheckout(
  request: Request,
  dependencies: StripeCheckoutDependencies,
) {
  let requestUrl: URL;
  try {
    requestUrl = new URL(request.url);
  } catch {
    return apiError(400, "INVALID_REQUEST_URL", "The request URL is invalid.");
  }

  if (!isAllowedTestHost(requestUrl.hostname)) {
    return apiError(
      403,
      "STRIPE_TEST_HOST_REQUIRED",
      "Stripe Checkout proof of concept is available only on local development and the staging hostname.",
    );
  }

  const declaredLength = Number(request.headers.get("content-length") ?? "0");
  if (
    Number.isFinite(declaredLength) &&
    declaredLength > MAX_CHECKOUT_BODY_BYTES
  ) {
    return apiError(413, "PAYLOAD_TOO_LARGE", "The request body is too large.");
  }

  let rawBody: string;
  try {
    rawBody = await request.text();
  } catch {
    return apiError(400, "INVALID_JSON", "The request body must be valid JSON.");
  }

  if (new TextEncoder().encode(rawBody).byteLength > MAX_CHECKOUT_BODY_BYTES) {
    return apiError(413, "PAYLOAD_TOO_LARGE", "The request body is too large.");
  }

  let input: unknown;
  try {
    input = JSON.parse(rawBody);
  } catch {
    return apiError(400, "INVALID_JSON", "The request body must be valid JSON.");
  }

  const validation = validateCheckoutPayload(input);
  if (!validation.ok) {
    return apiError(
      422,
      validation.code,
      "The test checkout request was rejected.",
    );
  }

  const secretKey = dependencies.secretKey?.trim();
  const keyMode = stripeSecretMode(secretKey);
  if (keyMode === "missing") {
    return apiError(
      503,
      "STRIPE_TEST_NOT_CONFIGURED",
      "Stripe Test Mode is not configured.",
    );
  }
  if (keyMode !== "test" || !secretKey) {
    return apiError(
      503,
      "STRIPE_TEST_KEY_REQUIRED",
      "Only a Stripe Test Mode secret key is accepted.",
    );
  }

  const orderId = `tb_order_${
    dependencies.createRequestId?.() ?? crypto.randomUUID()
  }`;
  const requestId = orderId;
  const createdAt = (dependencies.now?.() ?? new Date()).toISOString();
  const amountSubtotal = validation.data.items.reduce(
    (total, item) => total + item.product.unitAmount * item.quantity,
    0,
  );
  let checkoutConfiguration;
  try {
    checkoutConfiguration = getCommerceCheckoutConfiguration(
      dependencies.environment ?? {},
      amountSubtotal,
    );
  } catch {
    return apiError(
      503,
      "COMMERCE_CONFIGURATION_INVALID",
      "Commerce configuration is incomplete.",
    );
  }

  const order: CommerceOrder = {
    id: orderId,
    internalReference: orderId,
    cartVersion: 2,
    checkoutPolicy: checkoutConfiguration.policy,
    status: "checkout_pending",
    currency: "aed",
    amountSubtotal,
    amountDiscount: 0,
    amountShipping: checkoutConfiguration.policy.expectedShippingAmount,
    amountTax: 0,
    amountTotal:
      amountSubtotal + checkoutConfiguration.policy.expectedShippingAmount,
    customerEmail: validation.data.email,
    fulfillmentStatus: "pending",
    notificationStatus: "not_configured",
    createdAt,
    updatedAt: createdAt,
    items: validation.data.items.map(({ product, quantity }) => ({
      productKey: product.productKey,
      websiteProductId: product.websiteProductId,
      websiteSku: product.websiteSku,
      productName: product.name,
      quantity,
      unitAmount: product.unitAmount,
      subtotalAmount: product.unitAmount * quantity,
      discountAmount: 0,
      taxAmount: 0,
      totalAmount: product.unitAmount * quantity,
    })),
  };

  try {
    await dependencies.repository.createCheckoutOrder(order);
  } catch {
    return apiError(
      503,
      "COMMERCE_STORAGE_UNAVAILABLE",
      "Secure checkout storage is temporarily unavailable.",
    );
  }

  const safeMetadata = {
    tb_request_id: requestId,
    tb_order_id: orderId,
    cart_version: "2",
    integration: "stripe_test_commerce",
  };

  const params: Stripe.Checkout.SessionCreateParams = {
    mode: "payment",
    payment_method_types: ["card"],
    client_reference_id: orderId,
    line_items: validation.data.items.map(({ product, quantity }) => ({
      quantity,
      metadata: {
        tb_product_key: product.productKey,
        tb_website_product_id: product.websiteProductId,
        tb_website_sku: product.websiteSku,
      },
      price_data: {
        currency: validation.data.currency,
        unit_amount: product.unitAmount,
        product_data: {
          name: product.name,
          metadata: {
            tb_product_key: product.productKey,
            tb_website_product_id: product.websiteProductId,
            tb_website_sku: product.websiteSku,
          },
        },
      },
    })),
    success_url: `${STRIPE_TEST_STAGING_ORIGIN}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${STRIPE_TEST_STAGING_ORIGIN}/checkout?stripe_checkout=cancelled`,
    customer_email: validation.data.email,
    customer_creation: "always",
    billing_address_collection: "required",
    shipping_address_collection: {
      allowed_countries: checkoutConfiguration.allowedCountries,
    },
    shipping_options: checkoutConfiguration.shippingOptions,
    automatic_tax: {
      enabled: checkoutConfiguration.policy.automaticTaxEnabled,
    },
    allow_promotion_codes: checkoutConfiguration.policy.promotionCodesEnabled,
    phone_number_collection: { enabled: true },
    metadata: safeMetadata,
    payment_intent_data: { metadata: safeMetadata },
  };

  try {
    const session = await dependencies
      .createClient(secretKey)
      .createSession(params, { idempotencyKey: requestId });

    if (
      session.livemode ||
      !session.id.startsWith("cs_test_") ||
      !session.url
    ) {
      await dependencies.repository.markCheckoutFailed(
        orderId,
        "STRIPE_TEST_SESSION_REJECTED",
      );
      return apiError(
        502,
        "STRIPE_TEST_SESSION_REJECTED",
        "Stripe did not return a valid Test Mode Checkout Session.",
      );
    }

    await dependencies.repository.attachStripeSession(orderId, session.id);

    return Response.json(
      {
        ok: true,
        checkout: {
          sessionId: session.id,
          url: session.url,
          requestId,
          orderReference: orderId,
          currency: "AED",
          testMode: true,
        },
      },
      { status: 201, headers: { "Cache-Control": "no-store" } },
    );
  } catch {
    await dependencies.repository
      .markCheckoutFailed(orderId, "STRIPE_TEST_UNAVAILABLE")
      .catch(() => undefined);
    return apiError(
      502,
      "STRIPE_TEST_UNAVAILABLE",
      "Stripe Test Mode Checkout is temporarily unavailable.",
    );
  }
}
