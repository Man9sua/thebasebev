import assert from "node:assert/strict";
import test from "node:test";

import Stripe from "stripe";

import { SAMPLE_PRODUCTS } from "../src/data/sample-flavours";
import { getShopQuote, getShopUnitAmount, type ShopPaymentPricing } from "../src/lib/shop-payment";
import { SHOP_MAX_LINES, SHOP_MAX_QUANTITY } from "../src/lib/shop-limits";
import { handleStripeTestSession, type StripeSessionStatus } from "../src/lib/stripe-test-session";
import {
  handleStripeTestCheckout,
  STRIPE_TEST_CATALOG,
  type StripeCheckoutClient,
} from "../src/lib/stripe-test-checkout";
import {
  handleStripeTestWebhook,
  InMemoryStripeEventRegistry,
} from "../src/lib/stripe-test-webhook";

const ENDPOINT =
  "https://the-base-staging.mansua.workers.dev/api/checkout/stripe";
const TEST_SECRET_KEY = "sk_test_unit_test_only";
// Explicit fixtures only. Runtime prices and shipping remain unconfigured.
const PRICING: ShopPaymentPricing = {
  productUnitAmounts: Object.fromEntries(SAMPLE_PRODUCTS.map(product => [product.slug, product.slug === "milkshake" ? 4538 : 6788])),
  shipping: { products: { AE: { standard: 1234, express: 2345 } }, samples: { AE: { standard: 1234, express: 2345 }, KW: { standard: 3456 } } },
};
const CUSTOMER = { name: "Checkout QA", email: "buyer@example.com", phone: "+971500000000", city: "Dubai", street: "QA street", company: "Fixture company" };
const DEFAULTS = { kind: "products", country: "AE", shippingMethod: "standard", customer: CUSTOMER };

function checkoutRequest(body: unknown) {
  return new Request(ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(typeof body === "object" && body !== null && !Array.isArray(body) ? { ...DEFAULTS, ...body } : body),
  });
}

function validPayload() {
  return {
    ...DEFAULTS,
    currency: "AED",
    email: "buyer@example.com",
    items: [{ productId: "389328196132", flavor: "Strawberry", quantity: 2 }],
  };
}

function checkoutDependencies(
  createSession?: StripeCheckoutClient["createSession"],
) {
  return {
    secretKey: TEST_SECRET_KEY,
    pricing: PRICING,
    createRequestId: () => "unit-request-id",
    createClient: () => ({
      createSession:
        createSession ??
        (async () => ({
          id: "cs_test_unit_session",
          url: "https://checkout.stripe.com/c/pay/cs_test_unit_session",
          livemode: false,
        })),
    }),
  };
}

test("valid checkout uses server price, AED and staging return URLs", async () => {
  let capturedParams: Stripe.Checkout.SessionCreateParams | undefined;
  let capturedOptions: Stripe.RequestOptions | undefined;

  const response = await handleStripeTestCheckout(
    checkoutRequest(validPayload()),
    checkoutDependencies(async (params, options) => {
      capturedParams = params;
      capturedOptions = options;
      return {
        id: "cs_test_unit_session",
        url: "https://checkout.stripe.com/c/pay/cs_test_unit_session",
        livemode: false,
      };
    }),
  );

  assert.equal(response.status, 201);
  assert.equal(capturedParams?.mode, "payment");
  assert.equal(capturedParams?.line_items?.[0]?.quantity, 2);
  assert.equal(capturedParams?.line_items?.[0]?.price_data?.currency, "aed");
  assert.equal(capturedParams?.line_items?.[0]?.price_data?.unit_amount, 4538);
  assert.equal(
    capturedParams?.line_items?.[0]?.price_data?.product_data?.name,
    "Milkshake — Strawberry",
  );
  assert.equal(
    capturedParams?.success_url,
    "https://the-base-staging.mansua.workers.dev/checkout?session_id={CHECKOUT_SESSION_ID}&country=AE&kind=products",
  );
  assert.equal(
    capturedParams?.cancel_url,
    "https://the-base-staging.mansua.workers.dev/checkout?stripe_checkout=cancelled&country=AE&kind=products",
  );
  assert.equal(capturedParams?.customer_email, "buyer@example.com");
  assert.equal(capturedParams?.billing_address_collection, "required");
  assert.deepEqual(capturedParams?.shipping_address_collection?.allowed_countries, [
    "AE",
  ]);
  assert.equal(capturedParams?.shipping_options?.[0].shipping_rate_data?.fixed_amount?.amount, 1234);
  assert.equal(capturedParams?.line_items?.length, 1);
  assert.equal(capturedParams?.metadata?.tb_request_id, "tb_test_unit-request-id");
  assert.equal(capturedOptions?.idempotencyKey, "tb_test_unit-request-id");
});

test("invalid product is rejected before Stripe is called", async () => {
  const response = await handleStripeTestCheckout(
    checkoutRequest({
      currency: "AED",
      items: [{ productId: "not-a-product", flavor: "Strawberry", quantity: 1 }],
    }),
    checkoutDependencies(),
  );
  const body = await response.json();

  assert.equal(response.status, 422);
  assert.equal(body.error.code, "INVALID_PRODUCT");
});

test("a flavour the product is not sold in is rejected before Stripe is called", async () => {
  const response = await handleStripeTestCheckout(
    checkoutRequest({
      currency: "AED",
      items: [{ productId: "389328196132", flavor: "Free Of Charge", quantity: 1 }],
    }),
    checkoutDependencies(),
  );
  const body = await response.json();

  assert.equal(response.status, 422);
  assert.equal(body.error.code, "INVALID_FLAVOR");
});

test("an item with no flavour is rejected — the factory cannot fill it", async () => {
  const response = await handleStripeTestCheckout(
    checkoutRequest({
      currency: "AED",
      items: [{ productId: "389328196132", quantity: 1 }],
    }),
    checkoutDependencies(),
  );
  const body = await response.json();

  assert.equal(response.status, 422);
  assert.equal(body.error.code, "INVALID_FLAVOR");
});

test("two flavours of one product are two lines at the same server price", async () => {
  let capturedParams: Stripe.Checkout.SessionCreateParams | undefined;

  const response = await handleStripeTestCheckout(
    checkoutRequest({
      currency: "AED",
      items: [
        { productId: "389328196132", flavor: "Strawberry", quantity: 1 },
        { productId: "389328196132", flavor: "Mango", quantity: 3 },
      ],
    }),
    checkoutDependencies(async (params) => {
      capturedParams = params;
      return {
        id: "cs_test_unit_session",
        url: "https://checkout.stripe.com/c/pay/cs_test_unit_session",
        livemode: false,
      };
    }),
  );

  assert.equal(response.status, 201);
  assert.equal(capturedParams?.line_items?.length, 2);
  assert.deepEqual(
    capturedParams?.line_items?.map((line) => [
      line.price_data?.product_data?.name,
      line.quantity,
      line.price_data?.unit_amount,
    ]),
    [
      ["Milkshake — Strawberry", 1, 4538],
      ["Milkshake — Mango", 3, 4538],
    ],
  );
});

test("the same product and flavour twice is a duplicate line", async () => {
  const response = await handleStripeTestCheckout(
    checkoutRequest({
      currency: "AED",
      items: [
        { productId: "389328196132", flavor: "Strawberry", quantity: 1 },
        { productId: "389328196132", flavor: "Strawberry", quantity: 2 },
      ],
    }),
    checkoutDependencies(),
  );
  const body = await response.json();

  assert.equal(response.status, 422);
  assert.equal(body.error.code, "DUPLICATE_LINE");
});

test("all 22 shop ranges accept current flavours with fixture pricing", async () => {
  assert.equal(SAMPLE_PRODUCTS.length, 22);
  assert.equal(Object.keys(STRIPE_TEST_CATALOG).length, 22);
  for (const product of SAMPLE_PRODUCTS) {
    const response = await handleStripeTestCheckout(checkoutRequest({ ...validPayload(),
      items: [{ productId: product.slug, flavor: product.flavours[0], quantity: 1 }] }),
    checkoutDependencies(async params => {
      assert.equal(params.line_items?.[0].price_data?.product_data?.metadata?.slug, product.slug);
      return { id: "cs_test_range", url: "https://checkout.stripe.com/c/pay/cs_test_range", livemode: false };
    }));
    assert.equal(response.status, 201, product.slug);
  }
});

test("invalid customer email is rejected before Stripe is called", async () => {
  const response = await handleStripeTestCheckout(
    checkoutRequest({ ...validPayload(), email: "not-an-email" }),
    checkoutDependencies(),
  );
  const body = await response.json();

  assert.equal(response.status, 422);
  assert.equal(body.error.code, "INVALID_EMAIL");
});

test("tampered client price is rejected", async () => {
  const response = await handleStripeTestCheckout(
    checkoutRequest({
      currency: "AED",
      items: [{ productId: "389328196132", quantity: 1, price: 1 }],
    }),
    checkoutDependencies(),
  );
  const body = await response.json();

  assert.equal(response.status, 422);
  assert.equal(body.error.code, "CLIENT_PRICE_FORBIDDEN");
});

test("invalid quantity is rejected", async () => {
  const response = await handleStripeTestCheckout(
    checkoutRequest({
      currency: "AED",
      items: [{ productId: "389328196132", flavor: "Strawberry", quantity: 1.5 }],
    }),
    checkoutDependencies(),
  );
  const body = await response.json();

  assert.equal(response.status, 422);
  assert.equal(body.error.code, "INVALID_QUANTITY");
});

test("unsupported currency is rejected", async () => {
  const response = await handleStripeTestCheckout(
    checkoutRequest({ ...validPayload(), currency: "USD" }),
    checkoutDependencies(),
  );
  const body = await response.json();

  assert.equal(response.status, 422);
  assert.equal(body.error.code, "UNSUPPORTED_CURRENCY");
});

test("oversized checkout payload is rejected before Stripe is called", async () => {
  const response = await handleStripeTestCheckout(
    checkoutRequest({ ...validPayload(), note: "x".repeat(20_000) }),
    checkoutDependencies(),
  );
  const body = await response.json();

  assert.equal(response.status, 413);
  assert.equal(body.error.code, "PAYLOAD_TOO_LARGE");
});

test("missing Stripe secret is build-safe and returns 503", async () => {
  let clientCreated = false;
  const response = await handleStripeTestCheckout(
    checkoutRequest(validPayload()),
    {
      secretKey: undefined,
      pricing: PRICING,
      createClient: () => {
        clientCreated = true;
        throw new Error("must not create a client");
      },
    },
  );
  const body = await response.json();

  assert.equal(response.status, 503);
  assert.equal(body.error.code, "STRIPE_TEST_NOT_CONFIGURED");
  assert.equal(clientCreated, false);
});

test("live Stripe secret prefix is rejected before a client is created", async () => {
  let clientCreated = false;
  const response = await handleStripeTestCheckout(
    checkoutRequest(validPayload()),
    {
      secretKey: "sk_" + "live_unit_test_only",
      pricing: PRICING,
      createClient: () => {
        clientCreated = true;
        throw new Error("must not create a client");
      },
    },
  );
  const body = await response.json();

  assert.equal(response.status, 503);
  assert.equal(body.error.code, "STRIPE_TEST_KEY_REQUIRED");
  assert.equal(clientCreated, false);
});

test("production hostname cannot call the Stripe Test Mode proof of concept", async () => {
  const response = await handleStripeTestCheckout(
    new Request("https://thebasebev.com/api/checkout/stripe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(validPayload()),
    }),
    checkoutDependencies(),
  );
  const body = await response.json();

  assert.equal(response.status, 403);
  assert.equal(body.error.code, "STRIPE_TEST_HOST_REQUIRED");
});

test("webhook rejects an invalid Stripe signature", async () => {
  const response = await handleStripeTestWebhook(
    new Request(
      "https://the-base-staging.mansua.workers.dev/api/stripe/webhook",
      {
        method: "POST",
        headers: { "stripe-signature": "t=1,v1=invalid" },
        body: JSON.stringify({ id: "evt_test_invalid" }),
      },
    ),
    {
      webhookSecret: "whsec_unit_test_only",
      eventRegistry: new InMemoryStripeEventRegistry(),
    },
  );
  const body = await response.json();

  assert.equal(response.status, 400);
  assert.equal(body.error.code, "STRIPE_SIGNATURE_INVALID");
});

test("production hostname cannot receive Stripe Test webhook events", async () => {
  const response = await handleStripeTestWebhook(
    new Request("https://thebasebev.com/api/stripe/webhook", {
      method: "POST",
      headers: { "stripe-signature": "t=1,v1=unused" },
      body: "{}",
    }),
    {
      webhookSecret: "whsec_unit_test_only",
      eventRegistry: new InMemoryStripeEventRegistry(),
    },
  );
  const body = await response.json();

  assert.equal(response.status, 403);
  assert.equal(body.error.code, "STRIPE_TEST_HOST_REQUIRED");
});

test("verified duplicate webhook event is acknowledged without reprocessing", async () => {
  const webhookSecret = "whsec_unit_test_only";
  const payload = JSON.stringify({
    id: "evt_test_duplicate",
    object: "event",
    type: "checkout.session.completed",
    livemode: false,
    data: { object: { id: "cs_test_unit_session" } },
  });
  const signature = await Stripe.webhooks.generateTestHeaderStringAsync({
    payload,
    secret: webhookSecret,
    cryptoProvider: Stripe.createSubtleCryptoProvider(),
  });
  const registry = new InMemoryStripeEventRegistry();

  const deliver = () =>
    handleStripeTestWebhook(
      new Request(
        "https://the-base-staging.mansua.workers.dev/api/stripe/webhook",
        {
          method: "POST",
          headers: { "stripe-signature": signature },
          body: payload,
        },
      ),
      { webhookSecret, eventRegistry: registry },
    );

  const firstResponse = await deliver();
  const firstBody = await firstResponse.json();
  const duplicateResponse = await deliver();
  const duplicateBody = await duplicateResponse.json();

  assert.equal(firstResponse.status, 200);
  assert.equal(firstBody.duplicate, false);
  assert.equal(firstBody.processed, false);
  assert.equal(duplicateResponse.status, 200);
  assert.equal(duplicateBody.duplicate, true);
  assert.equal(duplicateBody.processed, false);
});

test("a correctly signed live-mode webhook event is rejected", async () => {
  const webhookSecret = "whsec_unit_test_only";
  const payload = JSON.stringify({
    id: "evt_live_mode_rejected",
    object: "event",
    type: "checkout.session.completed",
    livemode: true,
    data: { object: { id: "cs_live_mode_rejected" } },
  });
  const signature = await Stripe.webhooks.generateTestHeaderStringAsync({
    payload,
    secret: webhookSecret,
    cryptoProvider: Stripe.createSubtleCryptoProvider(),
  });
  const response = await handleStripeTestWebhook(
    new Request(
      "https://the-base-staging.mansua.workers.dev/api/stripe/webhook",
      {
        method: "POST",
        headers: { "stripe-signature": signature },
        body: payload,
      },
    ),
    {
      webhookSecret,
      eventRegistry: new InMemoryStripeEventRegistry(),
    },
  );
  const body = await response.json();

  assert.equal(response.status, 422);
  assert.equal(body.error.code, "STRIPE_LIVE_EVENT_REJECTED");
});

test("missing webhook secret does not attempt verification", async () => {
  let verificationAttempted = false;
  const response = await handleStripeTestWebhook(
    new Request(
      "https://the-base-staging.mansua.workers.dev/api/stripe/webhook",
      { method: "POST", body: "{}" },
    ),
    {
      webhookSecret: undefined,
      eventRegistry: new InMemoryStripeEventRegistry(),
      verifyEvent: async () => {
        verificationAttempted = true;
        throw new Error("must not verify");
      },
    },
  );
  const body = await response.json();

  assert.equal(response.status, 503);
  assert.equal(body.error.code, "STRIPE_WEBHOOK_NOT_CONFIGURED");
  assert.equal(verificationAttempted, false);
});

test("oversized webhook payload is rejected before signature verification", async () => {
  let verificationAttempted = false;
  const response = await handleStripeTestWebhook(
    new Request(
      "https://the-base-staging.mansua.workers.dev/api/stripe/webhook",
      {
        method: "POST",
        headers: { "stripe-signature": "t=1,v1=unused" },
        body: "x".repeat(1024 * 1024 + 1),
      },
    ),
    {
      webhookSecret: "whsec_unit_test_only",
      eventRegistry: new InMemoryStripeEventRegistry(),
      verifyEvent: async () => {
        verificationAttempted = true;
        throw new Error("must not verify");
      },
    },
  );
  const body = await response.json();

  assert.equal(response.status, 413);
  assert.equal(body.error.code, "STRIPE_WEBHOOK_TOO_LARGE");
  assert.equal(verificationAttempted, false);
});

test("public prices and delivery are unconfigured; samples are free but not shipping-free", () => {
  for (const product of SAMPLE_PRODUCTS) assert.equal(getShopUnitAmount(product.slug), null);
  const input = { kind: "products" as const, country: "AE", shippingMethod: "standard" as const,
    items: [{ slug: "milkshake", flavor: "Vanilla", quantity: 1 }] };
  const paid = getShopQuote(input);
  assert.equal(paid.ready, false);
  assert.equal(paid.subtotal, null);
  const samples = getShopQuote({ ...input, kind: "samples" });
  assert.equal(samples.ready, false);
  assert.equal(samples.subtotal, 0);
  assert.equal(samples.shipping, null);
  assert.equal(samples.total, null);
});

test("missing public pricing never creates a Stripe client even when a Test key exists", async () => {
  let calls = 0;
  const response = await handleStripeTestCheckout(checkoutRequest(validPayload()), {
    secretKey: TEST_SECRET_KEY, createClient: () => { calls++; throw new Error("No public prices approved"); },
  });
  assert.equal(response.status, 503);
  assert.equal((await response.json()).error.code, "CHECKOUT_PRICING_NOT_CONFIGURED");
  assert.equal(calls, 0);
});

test("product quote sums several products and shipping as separate integer amounts", () => {
  const quote = getShopQuote({ kind: "products", country: "AE", shippingMethod: "standard",
    items: [{ slug: "milkshake", flavor: "Vanilla", quantity: 2 }, { slug: "chocolate", flavor: "Hot Chocolate", quantity: 1 }] }, PRICING);
  assert.deepEqual(quote, { ready: true, subtotal: 15864, shipping: 1234, total: 17098, reason: null, currency: "aed" });
});

test("sample Stripe session charges only its separately configured shipping fee", async () => {
  let captured: Stripe.Checkout.SessionCreateParams | undefined;
  const response = await handleStripeTestCheckout(checkoutRequest({ ...validPayload(), kind: "samples", country: "KW",
    items: [{ productId: "389328196132", flavor: "Vanilla", quantity: 1 }, { productId: "tea", flavor: "Black", quantity: 1 }] }),
  checkoutDependencies(async params => {
    captured = params;
    return { id: "cs_test_sample", url: "https://checkout.stripe.com/c/pay/cs_test_sample", livemode: false };
  }));
  assert.equal(response.status, 201);
  assert.equal(captured?.line_items?.length, 2);
  for (const line of captured?.line_items ?? []) { assert.equal(line.price_data?.unit_amount, 0); assert.equal(line.quantity, 1); }
  assert.equal(captured?.shipping_options?.[0].shipping_rate_data?.fixed_amount?.amount, 3456);
  assert.deepEqual(captured?.shipping_address_collection?.allowed_countries, ["KW"]);
  assert.equal(captured?.payment_intent_data?.shipping?.address.country, "KW");
  assert.equal(captured?.metadata?.kind, "samples");
  assert.equal(captured?.automatic_tax, undefined); // No prototype 5% VAT is silently added.
});

test("several products accept current slug aliases including new ranges", async () => {
  let count = 0;
  const response = await handleStripeTestCheckout(checkoutRequest({ ...validPayload(), items: [
    { productId: "milkshake", flavor: "Vanilla", quantity: 2 }, { productId: "tea", flavor: "Black", quantity: 3 },
  ] }), checkoutDependencies(async params => {
    count = params.line_items?.length ?? 0;
    assert.equal(params.line_items?.[1].quantity, 3);
    return { id: "cs_test_many", url: "https://checkout.stripe.com/c/pay/cs_test_many", livemode: false };
  }));
  assert.equal(response.status, 201);
  assert.equal(count, 2);
});

test("legacy ID and slug cannot duplicate the same product flavour", async () => {
  const response = await handleStripeTestCheckout(checkoutRequest({ ...validPayload(), items: [
    { productId: "389328196132", flavor: "Vanilla", quantity: 1 }, { productId: "milkshake", flavor: "Vanilla", quantity: 1 },
  ] }), checkoutDependencies());
  assert.equal((await response.json()).error.code, "DUPLICATE_LINE");
});

test("sample checkout preserves more than six flavours and multiple free packs", async () => {
  const items = SAMPLE_PRODUCTS.slice(0, 8).map((product, index) => ({ productId: product.slug, flavor: product.flavours[0], quantity: index === 0 ? 12 : index + 2 }));
  let captured: Stripe.Checkout.SessionCreateParams | undefined;
  const response = await handleStripeTestCheckout(checkoutRequest({ ...validPayload(), kind: "samples", items }),
    checkoutDependencies(async params => {
      captured = params;
      return { id: "cs_test_multiple_samples", url: "https://checkout.stripe.com/c/pay/cs_test_multiple_samples", livemode: false };
    }));
  assert.equal(response.status, 201);
  assert.deepEqual(captured?.line_items?.map(item => item.quantity), items.map(item => item.quantity));
  assert.ok(captured?.line_items?.every(item => item.price_data?.unit_amount === 0));
  assert.equal(captured?.shipping_options?.[0].shipping_rate_data?.fixed_amount?.amount, 1234);
  assert.equal(captured?.metadata?.tb_subtotal, "0");
  assert.equal(captured?.metadata?.tb_total, "1234");
});

test("both checkout kinds reject malformed quantities and oversized transport payloads", async () => {
  const choices = SAMPLE_PRODUCTS.flatMap(product => product.flavours.map(flavor => ({ productId: product.slug, flavor, quantity: 1 })));
  assert.ok(choices.length > SHOP_MAX_LINES);
  for (const kind of ["samples", "products"]) {
    for (const quantity of [0, -1, 1.5, SHOP_MAX_QUANTITY + 1, Number.MAX_SAFE_INTEGER + 1]) {
      const response = await handleStripeTestCheckout(checkoutRequest({ ...validPayload(), kind, items: [{ ...choices[0], quantity }] }), checkoutDependencies());
      assert.equal((await response.json()).error.code, "INVALID_QUANTITY");
    }
    const response = await handleStripeTestCheckout(checkoutRequest({ ...validPayload(), kind, items: choices.slice(0, SHOP_MAX_LINES + 1) }), checkoutDependencies());
    assert.equal((await response.json()).error.code, "INVALID_ITEMS");
  }
});

test("shipping and tax tampering is rejected before any Stripe call", async () => {
  let calls = 0;
  for (const field of ["shipping", "shippingAmount", "shippingFee", "tax", "vat", "total", "discounts"]) {
    const response = await handleStripeTestCheckout(checkoutRequest({ ...validPayload(), [field]: 0 }),
      checkoutDependencies(async () => { calls++; throw new Error("Must reject tampering"); }));
    assert.equal((await response.json()).error.code, "CLIENT_PRICE_FORBIDDEN", field);
  }
  assert.equal(calls, 0);
});

test("unsupported delivery selection, unknown customer fields and missing contact are rejected", async () => {
  for (const [patch, code] of [
    [{ kind: "mixed" }, "INVALID_CHECKOUT_KIND"], [{ country: "ZZ" }, "INVALID_COUNTRY"],
    [{ shippingMethod: "own-dhl" }, "INVALID_SHIPPING_METHOD"],
    [{ customer: { ...CUSTOMER, cardNumber: "not-accepted" } }, "INVALID_CUSTOMER"],
    [{ customer: { ...CUSTOMER, name: "" } }, "INVALID_CUSTOMER"],
    [{ customer: { ...CUSTOMER, phone: "       " } }, "INVALID_CUSTOMER"],
  ] as const) {
    const response = await handleStripeTestCheckout(checkoutRequest({ ...validPayload(), ...patch }), checkoutDependencies());
    assert.equal((await response.json()).error.code, code);
  }
});

test("invalid fixture prices and missing/zero sample shipping never produce a payable quote", () => {
  const input = { kind: "products" as const, country: "AE", shippingMethod: "standard" as const,
    items: [{ slug: "milkshake", flavor: "Vanilla", quantity: 1 }] };
  for (const value of [-1, 1.5, 0, Number.MAX_SAFE_INTEGER + 1]) {
    assert.equal(getShopQuote(input, { ...PRICING, productUnitAmounts: { milkshake: value } }).ready, false);
  }
  assert.equal(getShopQuote({ ...input, kind: "samples" }, { ...PRICING, shipping: { samples: { AE: { standard: 0 } } } }).ready, false);
  assert.equal(getShopQuote({ ...input, kind: "samples", country: "SA" }, PRICING).ready, false);
});

test("cross-origin checkout cannot create a session", async () => {
  const response = await handleStripeTestCheckout(new Request(ENDPOINT, { method: "POST",
    headers: { "content-type": "application/json", origin: "https://another.example" }, body: JSON.stringify(validPayload()) }), checkoutDependencies());
  assert.equal(response.status, 403);
  assert.equal((await response.json()).error.code, "CHECKOUT_ORIGIN_REJECTED");
});

test("unsafe Stripe redirect URL is rejected", async () => {
  for (const url of ["https://another.example/pay", "javascript:alert(1)", "https://checkout.stripe.com@another.example/pay"]) {
    const response = await handleStripeTestCheckout(checkoutRequest(validPayload()), checkoutDependencies(async () => ({ id: "cs_test_bad", url, livemode: false })));
    assert.equal((await response.json()).error.code, "STRIPE_TEST_SESSION_REJECTED");
  }
});

const SESSION_ENDPOINT = `${ENDPOINT}/session?session_id=cs_test_verification`;
function verifiedSession(overrides: Partial<StripeSessionStatus> = {}): StripeSessionStatus {
  return { id: "cs_test_verification", livemode: false, status: "complete", payment_status: "paid", currency: "aed",
    amount_total: 5772, shipping_cost: { amount_total: 1234 },
    metadata: { integration: "the_base_shop_test", kind: "products", country: "AE", tb_subtotal: "4538", tb_shipping: "1234", tb_total: "5772" }, ...overrides };
}

test("session verification confirms only complete paid sessions and returns no customer data", async () => {
  const response = await handleStripeTestSession(new Request(SESSION_ENDPOINT), {
    secretKey: TEST_SECRET_KEY, retrieveSession: async () => verifiedSession(),
  });
  const body = await response.json();
  assert.equal(response.status, 200);
  assert.equal(body.checkout.confirmed, true);
  assert.equal(body.checkout.fulfilled, false);
  assert.equal(body.checkout.total, 5772);
  assert.equal(body.checkout.shipping, 1234);
  assert.equal(body.checkout.customer, undefined);
  assert.equal(body.checkout.metadata, undefined);
  assert.equal(response.headers.get("Cache-Control"), "no-store");
  for (const patch of [{ status: "open", payment_status: "unpaid" }, { status: "expired", payment_status: "unpaid" }, { payment_status: "no_payment_required" }]) {
    const pending = await handleStripeTestSession(new Request(SESSION_ENDPOINT), { secretKey: TEST_SECRET_KEY, retrieveSession: async () => verifiedSession(patch) });
    assert.equal((await pending.json()).checkout.confirmed, false);
  }
});

test("session verification rejects Live, foreign integration, changed ID and invalid totals", async () => {
  const patches: Partial<StripeSessionStatus>[] = [{ livemode: true }, { currency: "usd" }, { id: "cs_test_other" }, { amount_total: -1 },
    { metadata: { integration: "another-app", kind: "products" } }, { shipping_cost: { amount_total: -1 } },
    { amount_total: 6000 }, { shipping_cost: null }, { shipping_cost: { amount_total: 1 } },
    { metadata: { ...verifiedSession().metadata, tb_total: "0" } }];
  for (const patch of patches) {
    const response = await handleStripeTestSession(new Request(SESSION_ENDPOINT), { secretKey: TEST_SECRET_KEY, retrieveSession: async () => verifiedSession(patch) });
    assert.equal((await response.json()).error.code, "STRIPE_TEST_SESSION_REJECTED");
  }
});

test("sample verification matches the server shipping-only quote exactly", async () => {
  const metadata = { ...verifiedSession().metadata, kind: "samples", tb_subtotal: "0", tb_shipping: "1234", tb_total: "1234" };
  const response = await handleStripeTestSession(new Request(SESSION_ENDPOINT), { secretKey: TEST_SECRET_KEY,
    retrieveSession: async () => verifiedSession({ amount_total: 1234, metadata }) });
  assert.equal((await response.json()).checkout.confirmed, true);
  const invalid = await handleStripeTestSession(new Request(SESSION_ENDPOINT), { secretKey: TEST_SECRET_KEY,
    retrieveSession: async () => verifiedSession({ amount_total: 1235, metadata }) });
  assert.equal((await invalid.json()).error.code, "STRIPE_TEST_SESSION_REJECTED");
  const pending = await handleStripeTestSession(new Request(SESSION_ENDPOINT), { secretKey: TEST_SECRET_KEY,
    retrieveSession: async () => verifiedSession({ status: "open", payment_status: "unpaid", amount_total: 0, shipping_cost: null, metadata }) });
  assert.equal((await pending.json()).checkout.confirmed, false);
});

test("session readback rejects invalid ID, production host and Live key before Stripe access", async () => {
  let calls = 0;
  for (const [url, secretKey, code] of [
    [SESSION_ENDPOINT.replace("cs_test_verification", "cs_live_not_allowed"), TEST_SECRET_KEY, "INVALID_SESSION_ID"],
    [SESSION_ENDPOINT.replace("the-base-staging.mansua.workers.dev", "thebasebev.com"), TEST_SECRET_KEY, "STRIPE_TEST_HOST_REQUIRED"],
    [SESSION_ENDPOINT, "sk_live_not_allowed", "STRIPE_TEST_KEY_REQUIRED"],
  ]) {
    const response = await handleStripeTestSession(new Request(url), { secretKey, retrieveSession: async () => { calls++; return verifiedSession(); } });
    assert.equal((await response.json()).error.code, code);
  }
  assert.equal(calls, 0);
});
