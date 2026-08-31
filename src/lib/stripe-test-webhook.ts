import Stripe from "stripe";
import { CommerceIntegrationError, integrationErrorCode } from "./commerce/errors";
import { fulfillStripeCheckout } from "./commerce/fulfillment";
import type { CommerceNotifier } from "./commerce/notification";
import type { OdooCommerceService } from "./commerce/odoo";
import type { StripeCommerceClient } from "./commerce/stripe-session";
import type { CommerceRepository } from "./commerce/types";

const MAX_WEBHOOK_BODY_BYTES = 1024 * 1024;

export type VerifiedStripeEvent = Readonly<{
  id: string;
  type: string;
  livemode: boolean;
  sessionId?: string | null;
}>;

export type VerifyStripeEvent = (
  payload: string,
  signature: string,
  webhookSecret: string,
) => Promise<VerifiedStripeEvent>;

export type StripeWebhookDependencies = Readonly<{
  webhookSecret?: string;
  repository: CommerceRepository;
  stripeClient: StripeCommerceClient;
  odoo: OdooCommerceService | null;
  notifier: CommerceNotifier;
  verifyEvent?: VerifyStripeEvent;
  now?: () => Date;
}>;

export async function verifyStripeWebhookEvent(
  payload: string,
  signature: string,
  webhookSecret: string,
): Promise<VerifiedStripeEvent> {
  const event = await Stripe.webhooks.constructEventAsync(
    payload,
    signature,
    webhookSecret,
    undefined,
    Stripe.createSubtleCryptoProvider(),
  );

  const object = event.data.object as { id?: string };
  return {
    id: event.id,
    type: event.type,
    livemode: event.livemode,
    sessionId:
      typeof object?.id === "string" && object.id.startsWith("cs_")
        ? object.id
        : null,
  };
}

function apiError(status: number, code: string, message: string) {
  return Response.json(
    { ok: false, error: { code, message } },
    { status, headers: { "Cache-Control": "no-store" } },
  );
}

export async function handleStripeTestWebhook(
  request: Request,
  dependencies: StripeWebhookDependencies,
) {
  let requestUrl: URL;
  try {
    requestUrl = new URL(request.url);
  } catch {
    return apiError(400, "INVALID_REQUEST_URL", "The request URL is invalid.");
  }

  if (
    requestUrl.hostname !== "the-base-staging.mansua.workers.dev" &&
    requestUrl.hostname !== "localhost" &&
    requestUrl.hostname !== "127.0.0.1" &&
    requestUrl.hostname !== "[::1]"
  ) {
    return apiError(
      403,
      "STRIPE_TEST_HOST_REQUIRED",
      "Stripe Test webhooks are available only on local development and the staging hostname.",
    );
  }

  const webhookSecret = dependencies.webhookSecret?.trim();
  if (!webhookSecret) {
    return apiError(
      503,
      "STRIPE_WEBHOOK_NOT_CONFIGURED",
      "Stripe Test Mode webhook verification is not configured.",
    );
  }

  const signature = request.headers.get("stripe-signature");
  if (!signature) {
    return apiError(
      400,
      "STRIPE_SIGNATURE_MISSING",
      "The Stripe signature header is required.",
    );
  }

  const declaredLength = Number(request.headers.get("content-length") ?? "0");
  if (
    Number.isFinite(declaredLength) &&
    declaredLength > MAX_WEBHOOK_BODY_BYTES
  ) {
    return apiError(413, "STRIPE_WEBHOOK_TOO_LARGE", "The webhook body is too large.");
  }

  // Signature verification requires the exact raw request body.
  const payload = await request.text();
  if (new TextEncoder().encode(payload).byteLength > MAX_WEBHOOK_BODY_BYTES) {
    return apiError(413, "STRIPE_WEBHOOK_TOO_LARGE", "The webhook body is too large.");
  }
  let event: VerifiedStripeEvent;
  try {
    event = await (dependencies.verifyEvent ?? verifyStripeWebhookEvent)(
      payload,
      signature,
      webhookSecret,
    );
  } catch {
    return apiError(
      400,
      "STRIPE_SIGNATURE_INVALID",
      "The Stripe webhook signature is invalid.",
    );
  }

  if (event.livemode) {
    return apiError(
      422,
      "STRIPE_LIVE_EVENT_REJECTED",
      "This endpoint accepts Stripe Test Mode events only.",
    );
  }

  if (!event.id || !event.type) {
    return apiError(
      422,
      "STRIPE_EVENT_INVALID",
      "The verified Stripe event is invalid.",
    );
  }

  const supportedEvents = new Set([
    "checkout.session.completed",
    "checkout.session.async_payment_succeeded",
    "checkout.session.async_payment_failed",
  ]);
  if (!supportedEvents.has(event.type)) {
    return Response.json(
      { ok: true, received: true, ignored: true, processed: false, testMode: true },
      { status: 200, headers: { "Cache-Control": "no-store" } },
    );
  }
  if (!event.sessionId?.startsWith("cs_test_")) {
    return apiError(422, "STRIPE_SESSION_ID_INVALID", "The Stripe event is invalid.");
  }

  const now = (dependencies.now?.() ?? new Date()).toISOString();
  let claim;
  try {
    claim = await dependencies.repository.claimWebhookEvent({
      eventId: event.id,
      eventType: event.type,
      sessionId: event.sessionId,
      now,
    });
  } catch {
    return apiError(
      503,
      "COMMERCE_STORAGE_UNAVAILABLE",
      "Commerce storage is temporarily unavailable.",
    );
  }
  try {
    const result = await fulfillStripeCheckout({
      eventId: event.id,
      eventType: event.type,
      sessionId: event.sessionId,
      repository: dependencies.repository,
      stripe: dependencies.stripeClient,
      odoo: dependencies.odoo,
      notifier: dependencies.notifier,
      now: dependencies.now,
    });
    if (!result.processed) {
      await dependencies.repository.markWebhookFailed(
        event.id,
        "ODOO_COMMERCE_NOT_CONFIGURED",
      );
      return apiError(
        503,
        "COMMERCE_FULFILLMENT_PENDING",
        "The paid order was saved and fulfillment is pending configuration.",
      );
    }
    await dependencies.repository.markWebhookProcessed(event.id, now);
    return Response.json(
      {
        ok: true,
        received: true,
        duplicate: claim.duplicateEvent || result.duplicateSession,
        processed: result.processed,
        fulfillmentStatus: result.status,
        testMode: true,
      },
      { status: 200, headers: { "Cache-Control": "no-store" } },
    );
  } catch (reason) {
    const code = integrationErrorCode(reason);
    await dependencies.repository.markWebhookFailed(event.id, code).catch(() => undefined);
    const retryable =
      reason instanceof CommerceIntegrationError ? reason.retryable : true;
    return apiError(
      retryable ? 503 : 422,
      code,
      retryable
        ? "Commerce fulfillment is temporarily unavailable."
        : "The paid session failed commerce validation.",
    );
  }
}
