import assert from "node:assert/strict";
import test from "node:test";
import Stripe from "stripe";
import { handleStripeCheckout } from "../src/lib/stripe-checkout";
import { handleStripeWebhook } from "../src/lib/stripe-webhook";
import { resolveShopPaymentRuntime } from "../src/lib/shop-payment-runtime";
import { isAllowedStripeHost, validLiveOrigin } from "../src/lib/stripe-mode";
import { testOrderStore } from "./helpers/order-store";

const LIVE_ORIGIN = "https://the-base-production.mansua.workers.dev";
const STAGING_ORIGIN = "https://the-base-staging.mansua.workers.dev";
const policy = { mode: "live" as const, liveOrigin: LIVE_ORIGIN };
const payload = { kind: "products", country: "AE", shippingMethod: "standard", currency: "AED", consent: true,
  customer: { name: "Live fixture", email: "fixture@example.com", phone: "+971500000000", city: "Dubai", street: "Fixture" },
  items: [{ productId: "milkshake", flavor: "Vanilla", quantity: 2, kind: "products" }, { productId: "milkshake", flavor: "Vanilla", quantity: 1, kind: "samples" }] };

function request(origin = LIVE_ORIGIN) {
  return new Request(origin + "/api/checkout/stripe", { method: "POST", headers: { "Content-Type": "application/json", "Idempotency-Key": "live-unit-checkout" }, body: JSON.stringify(payload) });
}

function liveDependencies() {
  return { ...policy, secretKey: "sk_live_fixture_only", orders: testOrderStore(), orderReceiverReady: true, taxRateId: "txr_liveFixture",
    createClient: () => ({
      retrieveTaxRate: async () => ({ id: "txr_liveFixture", active: true, livemode: true, percentage: 5, inclusive: false, country: "AE" }) as Stripe.TaxRate,
      createSession: async () => ({ id: "cs_live_fixture", url: "https://checkout.stripe.com/c/pay/cs_live_fixture", livemode: true }),
    }),
  };
}

test("Live checkout uses approved AED goods, free samples, one taxed delivery and its own return origin", async () => {
  const dependencies = liveDependencies();
  const client = dependencies.createClient();
  let captured: Stripe.Checkout.SessionCreateParams | undefined;
  const response = await handleStripeCheckout(request(), { ...dependencies, createClient: () => ({ ...client, createSession: async (params, options) => {
    captured = params;
    assert.equal(options.idempotencyKey, "tb_live_live-unit-checkout");
    return client.createSession();
  } }) });
  assert.equal(response.status, 201);
  assert.equal((await response.json()).checkout.testMode, false);
  assert.equal(captured?.metadata?.integration, "the_base_shop_live");
  assert.equal(captured?.metadata?.tb_total, "9030");
  assert.deepEqual(captured?.line_items?.map(line => line.price_data?.unit_amount), [2800, 0, 3000]);
  assert.equal(captured?.success_url, LIVE_ORIGIN + "/checkout?session_id={CHECKOUT_SESSION_ID}&country=AE&kind=products");
  assert.equal(captured?.adaptive_pricing?.enabled, false);
  assert.equal(captured?.invoice_creation?.enabled, false);
  const stored = await dependencies.orders.bySession("cs_live_fixture");
  assert.equal(stored?.snapshot.mode, "live");
  assert.equal(stored?.state, "pending");
});

test("Live checkout cannot use a Test key, VAT rate or returned Test session", async () => {
  for (const scenario of ["key", "tax", "session"] as const) {
    const dependencies = liveDependencies();
    const client = dependencies.createClient();
    let creates = 0;
    const response = await handleStripeCheckout(request(), { ...dependencies,
      secretKey: scenario === "key" ? "sk_test_wrong_mode" : dependencies.secretKey,
      createClient: () => ({ ...client,
        retrieveTaxRate: async () => ({ ...await client.retrieveTaxRate(), livemode: scenario !== "tax" }),
        createSession: async () => { creates++; return { ...await client.createSession(), ...(scenario === "session" ? { id: "cs_test_wrong_mode", livemode: false } : {}) }; },
      }),
    });
    assert.equal(response.status, scenario === "session" ? 502 : 503);
    assert.equal(creates, scenario === "session" ? 1 : 0);
    assert.equal(await dependencies.orders.bySession("cs_test_wrong_mode"), null);
  }
});

test("Live keys cannot create checkout on staging, localhost, lookalike or unapproved hostnames", async () => {
  for (const origin of [STAGING_ORIGIN, "http://localhost:3000", "https://thebasebev.com", LIVE_ORIGIN + ".evil.example", "http://the-base-production.mansua.workers.dev"]) {
    const dependencies = liveDependencies();
    let calls = 0;
    const response = await handleStripeCheckout(request(origin), { ...dependencies, createClient: () => { calls++; throw new Error("Host must be rejected"); } });
    assert.equal(response.status, 403);
    assert.equal(calls, 0);
  }
  assert.equal((await handleStripeCheckout(request(), { ...liveDependencies(), liveOrigin: undefined })).status, 403);
});

test("the Live origin is an exact HTTPS origin and never the staging hostname", () => {
  for (const origin of [STAGING_ORIGIN, "https://user:password@example.com", "https://example.com/shop", LIVE_ORIGIN + "/", "http://example.com", "https://localhost", "https://example.com?next=1"]) {
    assert.equal(validLiveOrigin(origin), undefined);
  }
  assert.equal(validLiveOrigin(LIVE_ORIGIN), LIVE_ORIGIN);
  assert.equal(isAllowedStripeHost(new URL(LIVE_ORIGIN), {}), false);
  assert.equal(isAllowedStripeHost(new URL(STAGING_ORIGIN), {}), true);
});

test("explicitly approved Live domains retain their own checkout return URL without opening other hosts", async () => {
  const approved = ["https://thebasebev.com", "https://www.thebasebev.com"];
  for (const origin of approved) {
    const dependencies = liveDependencies();
    const client = dependencies.createClient();
    let captured: Stripe.Checkout.SessionCreateParams | undefined;
    const response = await handleStripeCheckout(request(origin), { ...dependencies, liveAdditionalOrigins: approved,
      createClient: () => ({ ...client, createSession: async params => { captured = params; return client.createSession(); } }),
    });
    assert.equal(response.status, 201);
    assert.equal(captured?.success_url, origin + "/checkout?session_id={CHECKOUT_SESSION_ID}&country=AE&kind=products");
    assert.ok(captured?.cancel_url?.startsWith(origin + "/checkout?"));
  }
  for (const origin of [STAGING_ORIGIN, "http://localhost:3000", "http://thebasebev.com", "https://thebasebev.com.evil.example", "https://unapproved.example"]) {
    const response = await handleStripeCheckout(request(origin), { ...liveDependencies(), liveAdditionalOrigins: approved,
      createClient: () => { throw new Error("Unapproved host reached Stripe"); },
    });
    assert.equal(response.status, 403);
  }
});

test("invalid additional Live origins reject the entire policy and never substitute for a missing primary", () => {
  const domain = "https://thebasebev.com";
  for (const invalid of [STAGING_ORIGIN, "http://example.com", "https://example.com/checkout", "https://localhost"]) {
    const configured = { ...policy, liveAdditionalOrigins: [domain, invalid] };
    assert.equal(isAllowedStripeHost(new URL(domain), configured), false);
    assert.equal(isAllowedStripeHost(new URL(LIVE_ORIGIN), configured), false);
  }
  assert.equal(isAllowedStripeHost(new URL(domain), { mode: "live", liveAdditionalOrigins: [domain] }), false);
});

test("Live activation needs its own key, ledger, receiver, webhook, VAT and production environment", () => {
  const configured = { APP_ENV: "production", SHOP_PAYMENTS_ENABLED: "live", SHOP_LIVE_ORIGIN: LIVE_ORIGIN,
    SHOP_ORDERS: {}, STRIPE_LIVE_SECRET_KEY: "sk_live_fixture", STRIPE_LIVE_WEBHOOK_SECRET: "whsec_live_fixture",
    STRIPE_LIVE_UAE_VAT_RATE_ID: "txr_liveFixture", ODOO_URL: "https://odoo.thebasebev.com", ODOO_API_KEY: "odoo_fixture", ODOO_LIVE_ACTION_ID: "9999" };
  assert.equal(resolveShopPaymentRuntime(configured).receiverReady, true);
  for (const name of Object.keys(configured)) {
    const missing = { ...configured } as Record<string, unknown>;
    delete missing[name];
    assert.equal(resolveShopPaymentRuntime(missing).receiverReady, false, name);
  }
  assert.equal(resolveShopPaymentRuntime({ ...configured, APP_ENV: "staging" }).receiverReady, false);
  assert.equal(resolveShopPaymentRuntime({ ...configured, STRIPE_LIVE_SECRET_KEY: undefined, STRIPE_SECRET_KEY: "sk_live_no_fallback" }).receiverReady, false);
  assert.equal(resolveShopPaymentRuntime({ ...configured, ODOO_LIVE_ACTION_ID: "1629" }).receiverReady, false);
  assert.equal(resolveShopPaymentRuntime({ ...configured, STRIPE_LIVE_SECRET_KEY: "sk_test_wrong" }).receiverReady, false);
  const restricted = resolveShopPaymentRuntime({ ...configured, STRIPE_LIVE_RESTRICTED_KEY: "rk_live_runtime_only" });
  assert.equal(restricted.secretKey, "rk_live_runtime_only");
  assert.equal(restricted.receiverReady, true);
  const domains = resolveShopPaymentRuntime({ ...configured, SHOP_LIVE_ADDITIONAL_ORIGINS: " https://thebasebev.com, https://www.thebasebev.com " });
  assert.equal(domains.receiverReady, true);
  assert.deepEqual(domains.liveAdditionalOrigins, ["https://thebasebev.com", "https://www.thebasebev.com"]);
  assert.equal(resolveShopPaymentRuntime({ ...configured, SHOP_LIVE_ADDITIONAL_ORIGINS: STAGING_ORIGIN }).receiverReady, false);
});

test("staging reads Test secrets even when Live credentials also exist", () => {
  const runtime = resolveShopPaymentRuntime({ APP_ENV: "staging", SHOP_PAYMENTS_ENABLED: "test", SHOP_ORDERS: {},
    ODOO_URL: "https://odoo.thebasebev.com", ODOO_API_KEY: "odoo_fixture", STRIPE_SECRET_KEY: "sk_test_fixture", STRIPE_LIVE_SECRET_KEY: "sk_live_unused",
    STRIPE_WEBHOOK_SECRET: "whsec_test_fixture", STRIPE_LIVE_WEBHOOK_SECRET: "whsec_live_unused", STRIPE_UAE_VAT_RATE_ID: "txr_test", STRIPE_LIVE_UAE_VAT_RATE_ID: "txr_live" });
  assert.equal(runtime.receiverReady, true);
  assert.equal(runtime.mode, "test");
  assert.equal(runtime.secretKey, "sk_test_fixture");
  assert.equal(runtime.taxRateId, "txr_test");
  assert.equal(runtime.webhookSecret, "whsec_test_fixture");
});

test("signed Live webhook runs only on approved Live origins; Test events and mismatched session IDs are rejected", async () => {
  const secret = "whsec_live_unit_only";
  let calls = 0;
  for (const scenario of ["valid", "domain", "staging", "test-event", "test-session"] as const) {
    const payload = JSON.stringify({ id: "evt_live_fixture", object: "event", type: "checkout.session.completed", livemode: scenario !== "test-event",
      data: { object: { object: "checkout.session", id: scenario === "test-session" ? "cs_test_wrong" : "cs_live_fixture" } } });
    const signature = await Stripe.webhooks.generateTestHeaderStringAsync({ payload, secret, cryptoProvider: Stripe.createSubtleCryptoProvider() });
    const origin = scenario === "staging" ? STAGING_ORIGIN : scenario === "domain" ? "https://thebasebev.com" : LIVE_ORIGIN;
    const response = await handleStripeWebhook(new Request(origin + "/api/stripe/webhook", {
      method: "POST", headers: { "stripe-signature": signature }, body: payload,
    }), { ...policy, liveAdditionalOrigins: ["https://thebasebev.com"], webhookSecret: secret, processSession: async () => { calls++; return { processed: true }; } });
    assert.equal(response.status, scenario === "valid" || scenario === "domain" ? 200 : scenario === "staging" ? 403 : 422);
    if (scenario === "valid" || scenario === "domain") assert.equal((await response.json()).testMode, false);
  }
  assert.equal(calls, 2);
});
