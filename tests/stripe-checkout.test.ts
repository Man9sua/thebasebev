import assert from "node:assert/strict";
import test from "node:test";
import Stripe from "stripe";

import { parseStoredCart } from "../src/lib/cart-store";
import {
  getVerifiedCheckoutStatus,
  isStripeTestSessionId,
  shouldClearCartAfterVerification,
} from "../src/lib/commerce/checkout-status";
import { CommerceIntegrationError } from "../src/lib/commerce/errors";
import { fulfillStripeCheckout } from "../src/lib/commerce/fulfillment";
import { MemoryCommerceRepository } from "../src/lib/commerce/memory-repository";
import {
  createOdooCommerceService,
  type OdooCommerceService,
} from "../src/lib/commerce/odoo";
import type { CommerceNotifier } from "../src/lib/commerce/notification";
import type { StripeCommerceSession } from "../src/lib/commerce/stripe-session";
import type { CommerceOrder } from "../src/lib/commerce/types";
import {
  handleStripeTestCheckout,
  type StripeCheckoutClient,
} from "../src/lib/stripe-test-checkout";
import { handleStripeTestWebhook } from "../src/lib/stripe-test-webhook";

const CHECKOUT_ENDPOINT = "https://the-base-staging.mansua.workers.dev/api/checkout/stripe";
const WEBHOOK_ENDPOINT = "https://the-base-staging.mansua.workers.dev/api/stripe/webhook";
const TEST_SECRET_KEY = "sk_test_unit_test_only";
const WEBHOOK_SECRET = "whsec_unit_test_only";
const SESSION_ID = "cs_test_unit_session";
const MILKSHAKE_ID = "389328196132";

function checkoutRequest(body: unknown) {
  return new Request(CHECKOUT_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

function validPayload() {
  return {
    currency: "AED",
    email: "buyer@example.test",
    items: [{ productId: MILKSHAKE_ID, quantity: 2 }],
  };
}

function checkoutDependencies(
  repository: MemoryCommerceRepository,
  createSession?: StripeCheckoutClient["createSession"],
) {
  return {
    secretKey: TEST_SECRET_KEY,
    repository,
    environment: {},
    createRequestId: () => "unit_order",
    now: () => new Date("2026-08-31T00:00:00.000Z"),
    createClient: () => ({
      createSession:
        createSession ??
        (async () => ({
          id: SESSION_ID,
          url: `https://checkout.stripe.test/pay/${SESSION_ID}`,
          livemode: false,
        })),
    }),
  };
}

async function initializeCheckout(
  repository = new MemoryCommerceRepository(),
  createSession?: StripeCheckoutClient["createSession"],
) {
  const response = await handleStripeTestCheckout(
    checkoutRequest(validPayload()),
    checkoutDependencies(repository, createSession),
  );
  assert.equal(response.status, 201);
  const order = await repository.getOrderBySessionId(SESSION_ID);
  assert.ok(order);
  return { repository, order };
}

function stripeSession(
  order: CommerceOrder,
  overrides: Partial<StripeCommerceSession> = {},
): StripeCommerceSession {
  return {
    id: order.stripeSessionId ?? SESSION_ID,
    livemode: false,
    mode: "payment",
    status: "complete",
    paymentStatus: "paid",
    currency: "aed",
    clientReferenceId: order.id,
    internalOrderId: order.id,
    paymentIntentId: "pi_test_unit",
    customerId: "cus_test_unit",
    customerEmail: "buyer@example.test",
    customerName: "Test Buyer",
    customerPhone: "+971500000000",
    billingAddress: { line1: "Test street", city: "Dubai", country: "AE" },
    shippingAddress: null,
    amountSubtotal: order.amountSubtotal,
    amountDiscount: 0,
    amountShipping: order.amountShipping,
    amountTax: 0,
    amountTotal: order.amountTotal,
    createdAt: "2026-08-31T00:00:00.000Z",
    lineItems: order.items.map((item) => ({
      productKey: item.productKey,
      websiteProductId: item.websiteProductId,
      websiteSku: item.websiteSku,
      quantity: item.quantity,
      unitAmount: item.unitAmount,
      amountSubtotal: item.subtotalAmount,
      amountDiscount: item.discountAmount,
      amountTax: item.taxAmount,
      amountTotal: item.totalAmount,
      currency: "aed",
    })),
    ...overrides,
  };
}

function odooStub(options: { error?: Error } = {}) {
  let calls = 0;
  const service: OdooCommerceService = {
    health: async () => ({ version: "19.0", json2: true }),
    fulfill: async (order) => {
      calls += 1;
      if (options.error) throw options.error;
      return {
        partnerId: 41,
        saleOrderId: 51,
        saleOrderName: "SO-TEST",
        mappings: order.items.map((item) => ({
          productKey: item.productKey,
          odooProductId: 101,
          odooDefaultCode: "MILKSHAKE-BASE",
        })),
      };
    },
  };
  return { service, calls: () => calls };
}

function notifierStub(results: ("sent" | "failed" | "not_configured")[] = ["sent"]) {
  let calls = 0;
  const notifier: CommerceNotifier = {
    async send() {
      const result = results[Math.min(calls, results.length - 1)];
      calls += 1;
      return result === "failed"
        ? { status: "failed", errorCode: "TEST_NOTIFICATION_FAILURE" }
        : { status: result };
    },
  };
  return { notifier, calls: () => calls };
}

async function signedWebhookRequest(eventId: string, sessionId = SESSION_ID) {
  const payload = JSON.stringify({
    id: eventId,
    object: "event",
    type: "checkout.session.completed",
    livemode: false,
    data: { object: { id: sessionId } },
  });
  const signature = await Stripe.webhooks.generateTestHeaderStringAsync({
    payload,
    secret: WEBHOOK_SECRET,
    cryptoProvider: Stripe.createSubtleCryptoProvider(),
  });
  return new Request(WEBHOOK_ENDPOINT, {
    method: "POST",
    headers: { "stripe-signature": signature },
    body: payload,
  });
}

function webhookDependencies(input: {
  repository: MemoryCommerceRepository;
  session: StripeCommerceSession;
  odoo?: OdooCommerceService | null;
  notifier?: CommerceNotifier;
}) {
  return {
    webhookSecret: WEBHOOK_SECRET,
    repository: input.repository,
    stripeClient: { retrieveSession: async () => input.session },
    odoo: input.odoo === undefined ? odooStub().service : input.odoo,
    notifier: input.notifier ?? notifierStub().notifier,
    now: () => new Date("2026-08-31T00:01:00.000Z"),
  };
}

test("valid checkout persists a server-priced AED snapshot and verified return URL", async () => {
  const repository = new MemoryCommerceRepository();
  let params: Stripe.Checkout.SessionCreateParams | undefined;
  const { order } = await initializeCheckout(repository, async (captured) => {
    params = captured;
    return { id: SESSION_ID, url: `https://checkout.stripe.test/pay/${SESSION_ID}`, livemode: false };
  });
  assert.equal(params?.line_items?.[0]?.price_data?.unit_amount, 4538);
  assert.equal(params?.line_items?.[0]?.quantity, 2);
  assert.equal(params?.line_items?.[0]?.price_data?.currency, "aed");
  assert.equal(params?.success_url, "https://the-base-staging.mansua.workers.dev/checkout/success?session_id={CHECKOUT_SESSION_ID}");
  assert.equal(order.amountTotal, 9076);
  assert.equal(order.items[0].websiteSku, `web:${MILKSHAKE_ID}`);
});

for (const [name, payload, code] of [
  ["invalid product", { ...validPayload(), items: [{ productId: "unknown", quantity: 1 }] }, "INVALID_PRODUCT"],
  ["tampered client price", { ...validPayload(), items: [{ productId: MILKSHAKE_ID, quantity: 1, price: 1 }] }, "CLIENT_PRICE_FORBIDDEN"],
  ["invalid quantity", { ...validPayload(), items: [{ productId: MILKSHAKE_ID, quantity: 1.5 }] }, "INVALID_QUANTITY"],
  ["unsupported currency", { ...validPayload(), currency: "USD" }, "UNSUPPORTED_CURRENCY"],
] as const) {
  test(`${name} is rejected before Stripe`, async () => {
    const response = await handleStripeTestCheckout(
      checkoutRequest(payload),
      checkoutDependencies(new MemoryCommerceRepository()),
    );
    const body = await response.json();
    assert.equal(response.status, 422);
    assert.equal(body.error.code, code);
  });
}

test("malformed versioned local cart degrades to an empty cart", () => {
  assert.deepEqual(parseStoredCart("not-json"), []);
  assert.deepEqual(parseStoredCart(JSON.stringify({ version: 2, items: [{ slug: 7 }] })), []);
});

test("missing and live Stripe secrets are rejected before client creation", async () => {
  for (const [secretKey, code] of [
    [undefined, "STRIPE_TEST_NOT_CONFIGURED"],
    ["sk_live_unit_test_only", "STRIPE_TEST_KEY_REQUIRED"],
  ] as const) {
    let created = false;
    const response = await handleStripeTestCheckout(checkoutRequest(validPayload()), {
      secretKey,
      repository: new MemoryCommerceRepository(),
      createClient: () => {
        created = true;
        throw new Error("must not create Stripe client");
      },
    });
    const body = await response.json();
    assert.equal(response.status, 503);
    assert.equal(body.error.code, code);
    assert.equal(created, false);
  }
});

test("invalid webhook signature returns 400 before storage or fulfillment", async () => {
  const response = await handleStripeTestWebhook(
    new Request(WEBHOOK_ENDPOINT, {
      method: "POST",
      headers: { "stripe-signature": "t=1,v1=invalid" },
      body: "{}",
    }),
    webhookDependencies({ repository: new MemoryCommerceRepository(), session: {} as StripeCommerceSession }),
  );
  assert.equal(response.status, 400);
  assert.equal((await response.json()).error.code, "STRIPE_SIGNATURE_INVALID");
});

test("valid signed paid webhook creates one fulfilled order", async () => {
  const { repository, order } = await initializeCheckout();
  const odoo = odooStub();
  const response = await handleStripeTestWebhook(
    await signedWebhookRequest("evt_test_paid"),
    webhookDependencies({ repository, session: stripeSession(order), odoo: odoo.service }),
  );
  const stored = await repository.getOrderById(order.id);
  assert.equal(response.status, 200);
  assert.equal(stored?.fulfillmentStatus, "fulfilled");
  assert.equal(stored?.odooSaleOrderName, "SO-TEST");
  assert.equal(odoo.calls(), 1);
});

test("duplicate Stripe event is acknowledged without a second Odoo order", async () => {
  const { repository, order } = await initializeCheckout();
  const odoo = odooStub();
  const dependencies = webhookDependencies({ repository, session: stripeSession(order), odoo: odoo.service });
  const first = await handleStripeTestWebhook(await signedWebhookRequest("evt_test_dup"), dependencies);
  const second = await handleStripeTestWebhook(await signedWebhookRequest("evt_test_dup"), dependencies);
  assert.equal(first.status, 200);
  assert.equal(second.status, 200);
  assert.equal((await second.json()).duplicate, true);
  assert.equal(repository.webhookAttempts("evt_test_dup"), 2);
  assert.equal(odoo.calls(), 1);
});

test("different event IDs for one session cannot create a second Odoo order", async () => {
  const { repository, order } = await initializeCheckout();
  const odoo = odooStub();
  const dependencies = webhookDependencies({ repository, session: stripeSession(order), odoo: odoo.service });
  assert.equal((await handleStripeTestWebhook(await signedWebhookRequest("evt_test_a"), dependencies)).status, 200);
  assert.equal((await handleStripeTestWebhook(await signedWebhookRequest("evt_test_b"), dependencies)).status, 200);
  assert.equal(odoo.calls(), 1);
});

test("unpaid session remains pending and never calls Odoo", async () => {
  const { repository, order } = await initializeCheckout();
  const odoo = odooStub();
  const response = await handleStripeTestWebhook(
    await signedWebhookRequest("evt_test_unpaid"),
    webhookDependencies({ repository, session: stripeSession(order, { paymentStatus: "unpaid" }), odoo: odoo.service }),
  );
  assert.equal(response.status, 200);
  assert.equal(odoo.calls(), 0);
  assert.equal((await repository.getOrderById(order.id))?.fulfillmentStatus, "pending");
});

test("unknown paid Stripe line item fails validation and never calls Odoo", async () => {
  const { repository, order } = await initializeCheckout();
  const odoo = odooStub();
  const lineItems = [{ ...stripeSession(order).lineItems[0], productKey: "unknown" }];
  const response = await handleStripeTestWebhook(
    await signedWebhookRequest("evt_test_unknown_product"),
    webhookDependencies({ repository, session: stripeSession(order, { lineItems }), odoo: odoo.service }),
  );
  assert.equal(response.status, 422);
  assert.equal(odoo.calls(), 0);
});

test("missing Odoo configuration preserves the paid order for retry", async () => {
  const { repository, order } = await initializeCheckout();
  const response = await handleStripeTestWebhook(
    await signedWebhookRequest("evt_test_odoo_missing"),
    webhookDependencies({ repository, session: stripeSession(order), odoo: null }),
  );
  const stored = await repository.getOrderById(order.id);
  assert.equal(response.status, 503);
  assert.equal(stored?.status, "paid");
  assert.equal(stored?.fulfillmentStatus, "failed");
  assert.equal(stored?.lastError, "ODOO_COMMERCE_NOT_CONFIGURED");
});

test("Odoo timeout preserves payment and marks retryable failure", async () => {
  const { repository, order } = await initializeCheckout();
  const odoo = odooStub({ error: new CommerceIntegrationError("ODOO_REQUEST_FAILED", true) });
  const response = await handleStripeTestWebhook(
    await signedWebhookRequest("evt_test_odoo_timeout"),
    webhookDependencies({ repository, session: stripeSession(order), odoo: odoo.service }),
  );
  const stored = await repository.getOrderById(order.id);
  assert.equal(response.status, 503);
  assert.equal(stored?.status, "paid");
  assert.equal(stored?.fulfillmentStatus, "failed");
  assert.equal(stored?.lastError, "ODOO_REQUEST_FAILED");
});

type OdooScenario = { existingPartner?: boolean; productMismatch?: boolean; amountMismatch?: boolean };

function createOdooFake(scenario: OdooScenario = {}) {
  const state = { partnerCreated: false, saleCreated: false, confirmed: false, partnerCreates: 0, saleCreates: 0 };
  const json = (value: unknown, status = 200) => new Response(JSON.stringify(value), { status, headers: { "Content-Type": "application/json" } });
  const fetcher: typeof fetch = async (input, init) => {
    const url = new URL(String(input));
    if (url.pathname === "/web/version") return json({ server_version: "19.0+e" });
    const [, , , model, method] = url.pathname.split("/");
    const body = init?.body ? JSON.parse(String(init.body)) : {};
    if (model === "res.users" && method === "context_get") return json({});
    if (model === "product.product" && method === "search_read") {
      return json([{ id: 101, name: "Milkshake", default_code: scenario.productMismatch ? "WRONG" : "MILKSHAKE-BASE", active: true, sale_ok: true }]);
    }
    if (model === "res.partner" && method === "search_read") {
      const deliverySearch = JSON.stringify(body.domain).includes("delivery");
      if (deliverySearch) return json([]);
      return scenario.existingPartner || state.partnerCreated ? json([{ id: 41, name: "Test Buyer" }]) : json([]);
    }
    if (model === "res.country" && method === "search_read") return json([{ id: 1 }]);
    if (model === "res.partner" && method === "create") {
      state.partnerCreated = true;
      state.partnerCreates += 1;
      return json(41);
    }
    if (model === "res.currency" && method === "search_read") return json([{ id: 1 }]);
    if (model === "product.pricelist" && method === "search_read") return json([{ id: 2 }]);
    if (model === "sale.order" && method === "search_read") {
      return state.saleCreated ? json([{ id: 51, name: "SO-TEST", state: state.confirmed ? "sale" : "draft", amount_total: 90.76 }]) : json([]);
    }
    if (model === "sale.order" && method === "create") {
      state.saleCreated = true;
      state.saleCreates += 1;
      return json(51);
    }
    if (model === "sale.order" && method === "read") {
      return json([{ id: 51, name: "SO-TEST", state: state.confirmed ? "sale" : "draft", amount_total: scenario.amountMismatch ? 1 : 90.76 }]);
    }
    if (model === "sale.order" && method === "action_confirm") {
      state.confirmed = true;
      return json(true);
    }
    return json({ error: `Unhandled ${model}.${method}` }, 500);
  };
  return { fetcher, state };
}

function odooEnvironment() {
  return {
    ODOO_COMMERCE_ENABLED: "true",
    ODOO_URL: "https://odoo.example.test",
    ODOO_API_KEY: "unit-test-key",
    ODOO_PRODUCT_MAPPING_JSON: JSON.stringify({ milkshake: { productId: 101, defaultCode: "MILKSHAKE-BASE" } }),
  };
}

async function directPaidOrder() {
  const { order } = await initializeCheckout();
  const session = stripeSession(order);
  return {
    ...order,
    status: "paid",
    stripePaymentIntentId: session.paymentIntentId,
    stripeCustomerId: session.customerId,
    customerEmail: session.customerEmail,
    customerName: session.customerName,
    customerPhone: session.customerPhone,
    billingAddress: session.billingAddress,
    shippingAddress: session.shippingAddress,
    paidAt: session.createdAt,
  } as CommerceOrder;
}

test("Odoo reuses an existing customer instead of creating a duplicate", async () => {
  const fake = createOdooFake({ existingPartner: true });
  const service = createOdooCommerceService(odooEnvironment(), fake.fetcher);
  assert.ok(service);
  const result = await service.fulfill(await directPaidOrder());
  assert.equal(result.partnerId, 41);
  assert.equal(fake.state.partnerCreates, 0);
});

test("Odoo creates a missing customer once and reuses it on retry", async () => {
  const fake = createOdooFake();
  const service = createOdooCommerceService(odooEnvironment(), fake.fetcher);
  assert.ok(service);
  const order = await directPaidOrder();
  await service.fulfill(order);
  await service.fulfill(order);
  assert.equal(fake.state.partnerCreates, 1);
  assert.equal(fake.state.saleCreates, 1);
});

test("Odoo creates and confirms one Sales Order with Stripe-matched total", async () => {
  const fake = createOdooFake({ existingPartner: true });
  const service = createOdooCommerceService(odooEnvironment(), fake.fetcher);
  assert.ok(service);
  const result = await service.fulfill(await directPaidOrder());
  assert.equal(result.saleOrderName, "SO-TEST");
  assert.equal(fake.state.saleCreates, 1);
  assert.equal(fake.state.confirmed, true);
});

test("Odoo product mapping mismatch blocks Sales Order creation", async () => {
  const fake = createOdooFake({ productMismatch: true });
  const service = createOdooCommerceService(odooEnvironment(), fake.fetcher);
  assert.ok(service);
  await assert.rejects(service.fulfill(await directPaidOrder()), (reason: unknown) => reason instanceof CommerceIntegrationError && reason.code === "ODOO_PRODUCT_MAPPING_MISMATCH");
  assert.equal(fake.state.saleCreates, 0);
});

test("Stripe versus Odoo amount mismatch prevents order confirmation", async () => {
  const fake = createOdooFake({ amountMismatch: true, existingPartner: true });
  const service = createOdooCommerceService(odooEnvironment(), fake.fetcher);
  assert.ok(service);
  await assert.rejects(service.fulfill(await directPaidOrder()), (reason: unknown) => reason instanceof CommerceIntegrationError && reason.code === "ODOO_STRIPE_AMOUNT_MISMATCH");
  assert.equal(fake.state.confirmed, false);
});

test("notification failure does not roll back Odoo and duplicate delivery retries only notification", async () => {
  const { repository, order } = await initializeCheckout();
  const odoo = odooStub();
  const notification = notifierStub(["failed", "sent"]);
  const dependencies = webhookDependencies({ repository, session: stripeSession(order), odoo: odoo.service, notifier: notification.notifier });
  assert.equal((await handleStripeTestWebhook(await signedWebhookRequest("evt_test_notify"), dependencies)).status, 200);
  assert.equal((await repository.getOrderById(order.id))?.notificationStatus, "failed");
  assert.equal((await handleStripeTestWebhook(await signedWebhookRequest("evt_test_notify"), dependencies)).status, 200);
  assert.equal((await repository.getOrderById(order.id))?.notificationStatus, "sent");
  assert.equal(odoo.calls(), 1);
  assert.equal(notification.calls(), 2);
});

test("failed Odoo fulfillment can resume once without duplicate order", async () => {
  const { repository, order } = await initializeCheckout();
  const failed = odooStub({ error: new CommerceIntegrationError("ODOO_REQUEST_FAILED", true) });
  const first = await fulfillStripeCheckout({
    eventId: "evt_test_recovery_a",
    eventType: "checkout.session.completed",
    sessionId: SESSION_ID,
    repository,
    stripe: { retrieveSession: async () => stripeSession(order) },
    odoo: failed.service,
    notifier: notifierStub().notifier,
  }).catch((reason) => reason);
  assert.ok(first instanceof CommerceIntegrationError);
  const recovered = odooStub();
  const second = await fulfillStripeCheckout({
    eventId: "evt_test_recovery_b",
    eventType: "checkout.session.completed",
    sessionId: SESSION_ID,
    repository,
    stripe: { retrieveSession: async () => stripeSession(order) },
    odoo: recovered.service,
    notifier: notifierStub().notifier,
  });
  assert.equal(second.status, "fulfilled");
  assert.equal(recovered.calls(), 1);
});

test("thank-you rejects invalid session IDs", () => {
  assert.equal(isStripeTestSessionId("manual-value"), false);
  assert.equal(isStripeTestSessionId(SESSION_ID), true);
});

test("thank-you does not confirm or clear an unpaid session", async () => {
  const { repository, order } = await initializeCheckout();
  const result = await getVerifiedCheckoutStatus({
    sessionId: SESSION_ID,
    repository,
    stripe: { retrieveSession: async () => stripeSession(order, { paymentStatus: "unpaid" }) },
  });
  assert.equal(result.ok, true);
  if (result.ok) {
    assert.equal(result.order.paymentConfirmed, false);
    assert.equal(shouldClearCartAfterVerification(result.order), false);
  }
});

test("thank-you confirms a server-retrieved paid session and permits cart clear", async () => {
  const { repository, order } = await initializeCheckout();
  const result = await getVerifiedCheckoutStatus({
    sessionId: SESSION_ID,
    repository,
    stripe: { retrieveSession: async () => stripeSession(order) },
  });
  assert.equal(result.ok, true);
  if (result.ok) {
    assert.equal(result.order.paymentConfirmed, true);
    assert.equal(result.order.amountTotal, 9076);
    assert.equal(shouldClearCartAfterVerification(result.order), true);
  }
});
