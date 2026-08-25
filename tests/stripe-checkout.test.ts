import assert from "node:assert/strict";
import test from "node:test";

import Stripe from "stripe";

import {
  handleStripeTestCheckout,
  type StripeCheckoutClient,
} from "../src/lib/stripe-test-checkout";
import {
  handleStripeTestWebhook,
  InMemoryStripeEventRegistry,
} from "../src/lib/stripe-test-webhook";

const ENDPOINT =
  "https://the-base-staging.mansua.workers.dev/api/checkout/stripe";
const TEST_SECRET_KEY = "sk_test_unit_test_only";

function checkoutRequest(body: unknown) {
  return new Request(ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

function validPayload() {
  return {
    currency: "AED",
    items: [{ productId: "389328196132", quantity: 2 }],
  };
}

function checkoutDependencies(
  createSession?: StripeCheckoutClient["createSession"],
) {
  return {
    secretKey: TEST_SECRET_KEY,
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
    capturedParams?.success_url,
    "https://the-base-staging.mansua.workers.dev/thank-you-order?session_id={CHECKOUT_SESSION_ID}",
  );
  assert.equal(
    capturedParams?.cancel_url,
    "https://the-base-staging.mansua.workers.dev/catalog?stripe_checkout=cancelled",
  );
  assert.equal(capturedParams?.metadata?.tb_request_id, "tb_test_unit-request-id");
  assert.equal(capturedOptions?.idempotencyKey, "tb_test_unit-request-id");
});

test("invalid product is rejected before Stripe is called", async () => {
  const response = await handleStripeTestCheckout(
    checkoutRequest({
      currency: "AED",
      items: [{ productId: "not-a-product", quantity: 1 }],
    }),
    checkoutDependencies(),
  );
  const body = await response.json();

  assert.equal(response.status, 422);
  assert.equal(body.error.code, "INVALID_PRODUCT");
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
      items: [{ productId: "389328196132", quantity: 1.5 }],
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
