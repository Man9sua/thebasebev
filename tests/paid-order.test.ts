import assert from "node:assert/strict";
import test from "node:test";
import { DatabaseSync } from "node:sqlite";
import Stripe from "stripe";
import { prepareOrderSnapshot } from "../src/lib/shop-order";
import { processPaidSession, type PaidOrderDependencies } from "../src/lib/stripe-paid-order";
import { handleStripeTestWebhook } from "../src/lib/stripe-test-webhook";
import { testOrderStore } from "./helpers/order-store";
import { handleStripeTestSession } from "../src/lib/stripe-test-session";
import { createStripeTestClient } from "../src/lib/stripe-test-client";

async function fixture(kind: "products" | "samples" = "products") {
  const database = new DatabaseSync(":memory:");
  const orders = testOrderStore(database);
  const snapshot = prepareOrderSnapshot({ kind, country: "AE", shippingMethod: "standard",
    customer: { name: "Payment QA", email: "payment-qa@example.com", phone: "+971500000000", city: "Dubai", street: "QA street" },
    items: kind === "samples" ? [{ slug: "milkshake", flavor: "Vanilla", quantity: 2, kind: "samples" }] : [{ slug: "milkshake", flavor: "Vanilla", quantity: 2, kind: "products" }, { slug: "milkshake", flavor: "Vanilla", quantity: 1, kind: "samples" }],
  }, "txr_fixture");
  const order = await orders.reserve("unit-checkout-key", snapshot);
  const metadata = { integration: "the_base_shop_test", tb_protocol: "2", tb_order_id: order.id, tb_snapshot_hash: order.hash };
  const session = { id: "cs_test_verified", object: "checkout.session", livemode: false, mode: "payment", status: "complete", payment_status: "paid",
    currency: "aed", amount_subtotal: snapshot.amounts.subtotal + snapshot.amounts.shipping, amount_total: snapshot.amounts.total, total_details: { amount_tax: snapshot.amounts.vat, amount_shipping: 0, amount_discount: 0 },
    metadata, payment_intent: "pi_verified", shipping_cost: null,
  } as unknown as Stripe.Checkout.Session;
  const payment = { id: "pi_verified", livemode: false, status: "succeeded", currency: "aed", amount: snapshot.amounts.total, amount_received: snapshot.amounts.total, metadata,
    latest_charge: { paid: true, refunded: false, amount_refunded: 0, disputed: false },
  } as unknown as Stripe.PaymentIntent;
  const lines = { has_more: false, data: snapshot.lines.map((row, index) => {
    const subtotal = row.quantity * row.unitAmount;
    const tax = row.kind === "samples" ? 0 : Math.round(subtotal * .05);
    return { quantity: row.quantity, currency: "aed", amount_subtotal: subtotal, amount_tax: tax, amount_discount: 0, amount_total: subtotal + tax,
      price: { unit_amount: row.unitAmount, product: { metadata: { tb_index: String(index), sku: row.sku, kind: row.kind } } },
      taxes: tax ? [{ rate: { id: "txr_fixture", percentage: 5, inclusive: false, livemode: false } }] : [],
    };
  }) } as unknown as Stripe.ApiList<Stripe.LineItem>;
  let creates = 0;
  const dependencies: PaidOrderDependencies = { orders, retrieveSession: async () => session, listLineItems: async () => lines, retrievePaymentIntent: async () => payment,
    createQuotation: async () => { creates++; return { id: 123, name: "TEST-QUOTATION", state: "draft", total: 9030, duplicate: false }; } };
  return { database, orders, order, snapshot, session, payment, lines, dependencies, creates: () => creates };
}

test("paid delivery creates one quotation and survives a fresh store instance", async () => {
  const f = await fixture();
  assert.deepEqual(await processPaidSession(f.session.id, f.dependencies), { processed: true, duplicate: false });
  const restarted = testOrderStore(f.database);
  assert.equal((await restarted.get(f.order.id))?.state, "fulfilled");
  assert.equal((await restarted.get(f.order.id))?.odooOrderId, 123);
  assert.deepEqual(await processPaidSession(f.session.id, { ...f.dependencies, orders: restarted }), { processed: true, duplicate: true });
  assert.equal(f.creates(), 1);
});

test("failed Odoo delivery stays paid and is retryable after a process restart", async () => {
  const f = await fixture();
  await assert.rejects(processPaidSession(f.session.id, { ...f.dependencies, createQuotation: async () => { throw new Error("Unavailable"); } }), /RETRY_REQUIRED/);
  assert.equal((await f.orders.get(f.order.id))?.state, "paid");
  assert.equal((await f.orders.get(f.order.id))?.odooOrderId, null);
  await processPaidSession(f.session.id, { ...f.dependencies, orders: testOrderStore(f.database) });
  assert.equal(f.creates(), 1);
});

test("a lost acknowledgement after Odoo commits retries the same quotation", async () => {
  const f = await fixture();
  let upstreamCreated = false;
  let quotations = 0;
  const createQuotation = async () => {
    const duplicate = upstreamCreated;
    if (!upstreamCreated) quotations++;
    upstreamCreated = true;
    return { id: 123, name: "TEST-QUOTATION", state: "draft", total: 9030, duplicate };
  };
  await assert.rejects(processPaidSession(f.session.id, { ...f.dependencies, createQuotation,
    orders: { ...f.orders, fulfilled: async () => { throw new Error("Connection lost"); } } }), /RETRY_REQUIRED/);
  assert.deepEqual(await processPaidSession(f.session.id, { ...f.dependencies, createQuotation }), { processed: true, duplicate: true });
  assert.equal(quotations, 1);
});

test("tampered totals, tax, variants, quantities and refunded payments never reach Odoo", async () => {
  for (const mutate of [
    (f: Awaited<ReturnType<typeof fixture>>) => { f.session.amount_total = 9031; },
    (f: Awaited<ReturnType<typeof fixture>>) => { f.session.total_details!.amount_tax = 0; },
    (f: Awaited<ReturnType<typeof fixture>>) => { f.lines.data[0].quantity = 3; },
    (f: Awaited<ReturnType<typeof fixture>>) => { (f.lines.data[0].price!.product as Stripe.Product).metadata.sku = "another"; },
    (f: Awaited<ReturnType<typeof fixture>>) => { f.lines.data[0].taxes![0].rate.id = "txr_another"; },
    (f: Awaited<ReturnType<typeof fixture>>) => { f.lines.data[0].taxes = undefined; },
    (f: Awaited<ReturnType<typeof fixture>>) => { f.payment.amount_received = 1; },
    (f: Awaited<ReturnType<typeof fixture>>) => { (f.payment.latest_charge as Stripe.Charge).amount_refunded = 1; },
    (f: Awaited<ReturnType<typeof fixture>>) => { f.payment.livemode = true; },
  ]) {
    const f = await fixture();
    mutate(f);
    await assert.rejects(processPaidSession(f.session.id, f.dependencies));
    assert.equal(f.creates(), 0);
    assert.equal((await f.orders.get(f.order.id))?.state, "pending");
  }
});

test("unpaid, foreign and missing-snapshot sessions cannot create a quotation", async () => {
  const f = await fixture();
  f.session.payment_status = "unpaid";
  assert.deepEqual(await processPaidSession(f.session.id, f.dependencies), { processed: false, pending: true });
  f.session.metadata!.integration = "another";
  assert.deepEqual(await processPaidSession(f.session.id, f.dependencies), { processed: false, ignored: true });
  f.session.metadata!.integration = "the_base_shop_test";
  f.session.metadata!.tb_order_id = "missing";
  await assert.rejects(processPaidSession(f.session.id, f.dependencies), /SNAPSHOT_MISSING/);
  assert.equal(f.creates(), 0);
});

test("checkout idempotency keys bind to the complete immutable server snapshot", async () => {
  const f = await fixture();
  const same = await testOrderStore(f.database).reserve("unit-checkout-key", { ...f.snapshot, customer: { ...f.snapshot.customer } });
  assert.equal(same.id, f.order.id);
  await assert.rejects(f.orders.reserve("unit-checkout-key", { ...f.snapshot, customer: { ...f.snapshot.customer, email: "changed@example.com" } }), /KEY_REUSED/);
  await f.orders.attachSession(f.order.id, f.session.id);
  await assert.rejects(f.orders.attachSession(f.order.id, "cs_test_another"), /STATE_CONFLICT/);
});

test("signed failed webhook receives 503 and the same event can later succeed", async () => {
  const secret = "whsec_unit_only";
  const payload = JSON.stringify({ id: "evt_retry", object: "event", type: "checkout.session.completed", livemode: false,
    data: { object: { object: "checkout.session", id: "cs_test_retry" } } });
  const signature = await Stripe.webhooks.generateTestHeaderStringAsync({ payload, secret, cryptoProvider: Stripe.createSubtleCryptoProvider() });
  let attempts = 0;
  const deliver = () => handleStripeTestWebhook(new Request("https://the-base-staging.mansua.workers.dev/api/stripe/webhook", {
    method: "POST", headers: { "stripe-signature": signature }, body: payload,
  }), { webhookSecret: secret, processSession: async () => { if (attempts++ === 0) throw new Error("Odoo unavailable"); return { processed: true }; } });
  assert.equal((await deliver()).status, 503);
  const retry = await deliver();
  assert.equal(retry.status, 200);
  assert.equal((await retry.json()).processed, true);
  assert.equal(attempts, 2);
});

const receiptUrl = "https://the-base-staging.mansua.workers.dev/api/checkout/stripe/session?session_id=cs_test_verified";
test("Stripe adapter explicitly expands tax rates as well as product variants", async () => {
  const original = globalThis.fetch;
  const urls: URL[] = [];
  globalThis.fetch = async input => {
    urls.push(new URL(input instanceof Request ? input.url : String(input)));
    return Response.json({ object: "list", data: [], has_more: false, url: "/v1/checkout/sessions/cs_test_adapter/line_items" });
  };
  try {
    await createStripeTestClient("sk_test_fixture").listLineItems("cs_test_adapter");
    assert.equal(urls.length, 1);
    const expansions = [...urls[0].searchParams.entries()].filter(([key]) => key.startsWith("expand")).map(([, value]) => value);
    assert.ok(expansions.includes("data.price.product"));
    assert.ok(expansions.includes("data.taxes"));
    assert.equal(urls[0].searchParams.get("limit"), "100");
  } finally { globalThis.fetch = original; }
});
test("receipt reads the persisted order, discloses no customer and never delivers to Odoo", async () => {
  const f = await fixture();
  await f.orders.attachSession(f.order.id, f.session.id);
  f.session.customer_details = { name: "Private buyer", email: "private@example.com" } as Stripe.Checkout.Session.CustomerDetails;
  const dependencies = { secretKey: "sk_test_fixture", orders: f.orders, retrieveSession: async () => f.session };
  const response = await handleStripeTestSession(new Request(receiptUrl), dependencies);
  const body = await response.json();
  assert.equal(body.checkout.confirmed, true);
  assert.equal(body.checkout.fulfilled, false);
  assert.equal(body.checkout.total, 9030);
  assert.equal(body.checkout.shipping, 3000);
  assert.equal(body.checkout.customer, undefined);
  assert.equal(body.checkout.metadata, undefined);
  assert.equal(f.creates(), 0);
  assert.equal((await f.orders.get(f.order.id))?.state, "pending");
  assert.equal(response.headers.get("Cache-Control"), "no-store");
  await f.orders.paid(f.order.id, "pi_verified");
  await f.orders.fulfilled(f.order.id, 123, "TEST-QUOTATION");
  assert.equal((await (await handleStripeTestSession(new Request(receiptUrl), dependencies)).json()).checkout.quotation, "TEST-QUOTATION");
});

test("unpaid, expired and missing ledger receipts cannot report order fulfillment", async () => {
  const f = await fixture();
  await f.orders.attachSession(f.order.id, f.session.id);
  for (const status of ["open", "expired"] as const) {
    f.session.status = status;
    f.session.payment_status = "unpaid";
    const response = await handleStripeTestSession(new Request(receiptUrl + "&paid=true&fulfilled=true"), { secretKey: "sk_test_fixture", orders: f.orders, retrieveSession: async () => f.session });
    const body = await response.json();
    assert.equal(body.checkout.confirmed, false);
    assert.equal(body.checkout.fulfilled, false);
  }
  assert.equal((await handleStripeTestSession(new Request(receiptUrl), { secretKey: "sk_test_fixture", retrieveSession: async () => { throw new Error("Must not verify without ledger"); } })).status, 503);
  assert.equal(f.creates(), 0);
});

test("receipt rejects changed identities, currency, total, VAT and snapshot hash", async () => {
  for (const patch of [{ id: "cs_test_another" }, { livemode: true }, { currency: "usd" }, { amount_total: 1 },
    { amount_subtotal: 1 }, { metadata: { integration: "foreign" } },
    { total_details: { amount_tax: 0, amount_discount: 0, amount_shipping: 0 } }]) {
    const f = await fixture();
    await f.orders.attachSession(f.order.id, f.session.id);
    Object.assign(f.session, patch);
    const response = await handleStripeTestSession(new Request(receiptUrl), { secretKey: "sk_test_fixture", orders: f.orders, retrieveSession: async () => f.session });
    assert.equal(response.status, 502);
  }
  let calls = 0;
  for (const [url, key, expected] of [[receiptUrl.replace('cs_test_verified','cs_live_invalid'), 'sk_test_fixture', 'INVALID_SESSION_ID'],
    [receiptUrl.replace('the-base-staging.mansua.workers.dev','thebasebev.com'), 'sk_test_fixture', 'STRIPE_TEST_HOST_REQUIRED'],
    [receiptUrl,'sk_live_invalid','STRIPE_TEST_KEY_REQUIRED']] as const) {
    const response = await handleStripeTestSession(new Request(url), { secretKey: key, retrieveSession: async () => { calls++; throw new Error("Must reject before Stripe"); } });
    assert.equal((await response.json()).error.code, expected);
  }
  assert.equal(calls, 0);
});

test("sample-only receipt includes VAT and verifies the delivery-only amount", async () => {
  const f = await fixture("samples");
  await f.orders.attachSession(f.order.id, f.session.id);
  const dependencies = { secretKey: "sk_test_fixture", orders: f.orders, retrieveSession: async () => f.session };
  const response = await handleStripeTestSession(new Request(receiptUrl), dependencies);
  const body = await response.json();
  assert.equal(body.checkout.confirmed, true);
  assert.equal(body.checkout.total, 3150);
  assert.equal(body.checkout.kind, "samples");
  f.session.amount_total = 3151;
  assert.equal((await handleStripeTestSession(new Request(receiptUrl), dependencies)).status, 502);
});
