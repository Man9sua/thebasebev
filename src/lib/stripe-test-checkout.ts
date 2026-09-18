import type Stripe from "stripe";

export const STRIPE_TEST_STAGING_ORIGIN =
  "https://the-base-staging.mansua.workers.dev";

const MAX_LINE_ITEMS = 20;
const MAX_QUANTITY_PER_ITEM = 100;
const MAX_CHECKOUT_BODY_BYTES = 16 * 1024;

type StripeTestProduct = Readonly<{
  name: string;
  unitAmount: number;
  /** The slug the product pages publish it under, for the drift test below. */
  slug: string;
  /**
   * The flavours this product may be ordered in.
   *
   * Here for the same reason the price is here. A cart line is a product *and*
   * a flavour — that is what the factory fills — so the flavour is written into
   * the Stripe line, and anything written into an order is the server's to
   * decide rather than the client's to send. `tests/stripe-checkout.test.ts`
   * holds this list against the product pages' own so the two cannot drift.
   */
  flavors: readonly string[];
}>;

// Test-only, server-authoritative snapshot of the prices preserved from the
// audited Tilda export, and of the flavours each pouch is sold in. The API
// never accepts an amount supplied by a client, and never a flavour that is not
// in this list.
export const STRIPE_TEST_CATALOG = Object.freeze({
  "194500823312": {
    name: "Sugar Free",
    unitAmount: 1422,
    slug: "sugar-free",
    flavors: ["Amaretto", "Banana", "Black Currant", "Blueberry", "Caramel", "Cherry", "Coconut", "Grapefruit", "Green Apple", "Hazelnut", "Heavenly", "Melon", "Mango", "Mint", "Peach", "Pear", "Pineapple", "Pistachio", "Peppermint", "Raspberry", "Strawberry"],
  },
  "207187094752": {
    name: "Frappe",
    unitAmount: 4940,
    slug: "frappe",
    flavors: ["Coffee", "Chocolate", "Base No Added Sugar", "Green Tea", "Mocha", "Pistachio", "Purple Yum UBE", "Salted Caramel", "Strawberry Matcha", "Vanilla"],
  },
  "293702296702": {
    name: "Iced Tea",
    unitAmount: 4281,
    slug: "iced-tea",
    flavors: ["Base No Added Sugar", "Lemon", "Green", "Mango", "Peach", "Strawberry"],
  },
  "296069682122": {
    name: "Chocolate",
    unitAmount: 6788,
    slug: "chocolate",
    flavors: ["Classic", "Orange", "Strawberry", "Mocha", "Pistachio", "Premium"],
  },
  "316933484392": {
    name: "Garnish",
    unitAmount: 491,
    slug: "garnish",
    flavors: ["Banana", "Cherry", "Blueberry", "Mango", "Papaya", "Pomegranate", "Raspberry", "Salted Caramel", "Strawberry", "Kiwi", "Dragon Fruit", "Black Currant"],
  },
  "324849428612": {
    name: "Jam",
    unitAmount: 6494,
    slug: "jam",
    flavors: ["Strawberry", "Watermelon"],
  },
  "389328196132": {
    name: "Milkshake",
    unitAmount: 4538,
    slug: "milkshake",
    flavors: ["Dates", "Banana", "Caramel", "Chocolate", "HoneyDew", "Mango", "Mango Lassi", "Base No Added Sugar", "Rainbow Unicorn", "Raspberry", "Strawberry", "Vanilla", "Yogurt", "Yogurt Base No Added Sugar"],
  },
  "466013811412": {
    name: "Raf",
    unitAmount: 3874,
    slug: "raf-coffee",
    flavors: ["Banana Ice Cream", "Orange Sundae", "Pineapple Caramel", "Pistachio", "Pomegranate", "Ptichye Moloko", "Cherry coconut", "Tary", "Raspberry Coconut", "Salted Caramel", "Spanish Latte", "Spanish Peach", "Vanilla", "Tangerine Cookie", "Raf Base No Added Sugar"],
  },
  "778280145182": {
    name: "Cordial",
    unitAmount: 5015,
    slug: "cordial",
    flavors: ["Classic Mojito", "Red Rose Lemon", "Ginger Citrus", "Hibiscus Apple", "Lemon Ginger", "Lemonade", "Lavender Peach", "Mango", "Frangelico", "Mango Lemongrass", "Mango Pink Grapefruit Mojito", "Minty Pineapple", "Passion Fruit Mojito", "Peach Rosemary", "Raspberry Mint", "Spiced Mandarin", "Strawberry Mojito", "Sweet and Sour Mix", "Watermelon Mojito"],
  },
  "781170478702": {
    name: "Cream Latte",
    unitAmount: 3876,
    slug: "cream-latte",
    flavors: ["Birds Dream", "Blueberry", "Cheesy Cream", "Citrus Sundae", "Tropical Berry", "Salty Carmel Sunset", "Golden Caramel Nana", "Vanilla Sky", "Nutty Pistachio"],
  },
  "827401503212": {
    name: "Chai Latte",
    unitAmount: 5205,
    slug: "chai-latte",
    flavors: ["Karak", "Masala"],
  },
  "888812727292": {
    name: "Sugar Syrop",
    unitAmount: 4882,
    slug: "sugar-syrup",
    flavors: ["Blueberry", "Hazelnut", "Mango", "Peppermint", "Raspberry", "Salted Caramel", "Strawberry", "Vanilla", "Peach", "Pineapple", "Red Apple"],
  },
  "975474893862": {
    name: "Matcha",
    unitAmount: 7042,
    slug: "matcha",
    flavors: ["Anchan Blueberry", "Classic", "Mango Coconut", "Purple Yum Ube", "Pure", "Base No Added Sugar", "Pink", "Raspberry", "Strawberry", "Hojicha", "Pecan Kumquat"],
  },
} satisfies Record<string, StripeTestProduct>);

type CatalogProductId = keyof typeof STRIPE_TEST_CATALOG;

type ValidatedCheckout = Readonly<{
  currency: "aed";
  email?: string;
  items: ReadonlyArray<
    Readonly<{
      productId: CatalogProductId;
      flavor: string;
      quantity: number;
      product: StripeTestProduct;
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
  createRequestId?: () => string;
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

  // A line is a product and a flavour, so two flavours of one product are two
  // lines. Only the same pair twice is a duplicate.
  const seenLines = new Set<string>();
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
      !Object.hasOwn(STRIPE_TEST_CATALOG, productId)
    ) {
      return { ok: false, code: "INVALID_PRODUCT" };
    }

    const typedProductId = productId as CatalogProductId;
    const catalogProduct = STRIPE_TEST_CATALOG[typedProductId];

    /*
     * The flavour is held against what the product is actually sold in, for the
     * same reason the price is never taken from the client: it is written into
     * the line the merchant reads off the order, so an unstocked flavour is a
     * rejected request rather than something to be produced.
     */
    const flavor = item.flavor;
    if (typeof flavor !== "string" || !catalogProduct.flavors.includes(flavor)) {
      return { ok: false, code: "INVALID_FLAVOR" };
    }

    const line = `${productId} ${flavor}`;
    if (seenLines.has(line)) {
      return { ok: false, code: "DUPLICATE_LINE" };
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

    seenLines.add(line);
    items.push({
      productId: typedProductId,
      flavor,
      quantity,
      product: catalogProduct,
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

  const requestId = `tb_test_${
    dependencies.createRequestId?.() ?? crypto.randomUUID()
  }`;
  const safeMetadata = {
    tb_request_id: requestId,
    integration: "stripe_test_poc",
  };

  const params: Stripe.Checkout.SessionCreateParams = {
    mode: "payment",
    payment_method_types: ["card"],
    // The flavour goes in the name because it is what has to be produced and
    // shipped. The amount is still the server's own, per pouch, whichever
    // flavour it is.
    line_items: validation.data.items.map(({ product, flavor, quantity }) => ({
      quantity,
      price_data: {
        currency: validation.data.currency,
        unit_amount: product.unitAmount,
        product_data: { name: `${product.name} — ${flavor}` },
      },
    })),
    success_url: `${STRIPE_TEST_STAGING_ORIGIN}/thank-you-order?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${STRIPE_TEST_STAGING_ORIGIN}/checkout?stripe_checkout=cancelled`,
    customer_email: validation.data.email,
    billing_address_collection: "required",
    shipping_address_collection: {
      allowed_countries: ["AE", "SA", "KZ", "GB"],
    },
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
      return apiError(
        502,
        "STRIPE_TEST_SESSION_REJECTED",
        "Stripe did not return a valid Test Mode Checkout Session.",
      );
    }

    return Response.json(
      {
        ok: true,
        checkout: {
          sessionId: session.id,
          url: session.url,
          requestId,
          currency: "AED",
          testMode: true,
        },
      },
      { status: 201, headers: { "Cache-Control": "no-store" } },
    );
  } catch {
    return apiError(
      502,
      "STRIPE_TEST_UNAVAILABLE",
      "Stripe Test Mode Checkout is temporarily unavailable.",
    );
  }
}
