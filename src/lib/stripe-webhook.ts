import Stripe from "stripe";
import { isAllowedStripeHost, isStripeSessionId, type StripePolicy } from "./stripe-mode";

const MAX_WEBHOOK_BODY_BYTES = 1024 * 1024;

export type VerifiedStripeEvent = Readonly<{
  id: string;
  type: string;
  livemode: boolean;
  sessionId?: string;
}>;

export type VerifyStripeEvent = (
  payload: string,
  signature: string,
  webhookSecret: string,
) => Promise<VerifiedStripeEvent>;

export type StripeWebhookDependencies = StripePolicy & Readonly<{
  webhookSecret?: string;
  verifyEvent?: VerifyStripeEvent;
  processSession?: (id: string) => Promise<{ processed: boolean; duplicate?: boolean; ignored?: boolean; pending?: boolean }>;
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

  const object = event.data.object;
  return { id: event.id, type: event.type, livemode: event.livemode,
    ...(object.object === "checkout.session" ? { sessionId: object.id } : {}) };
}

function apiError(status: number, code: string, message: string) {
  return Response.json(
    { ok: false, error: { code, message } },
    { status, headers: { "Cache-Control": "no-store" } },
  );
}

export async function handleStripeWebhook(
  request: Request,
  dependencies: StripeWebhookDependencies,
) {
  let requestUrl: URL;
  try {
    requestUrl = new URL(request.url);
  } catch {
    return apiError(400, "INVALID_REQUEST_URL", "The request URL is invalid.");
  }

  const live = dependencies.mode === "live";
  if (!isAllowedStripeHost(requestUrl, dependencies)) {
    return apiError(
      403,
      "STRIPE_HOST_REJECTED",
      "Stripe webhooks are unavailable on this hostname.",
    );
  }

  const webhookSecret = dependencies.webhookSecret?.trim();
  if (!webhookSecret) {
    return apiError(
      503,
      "STRIPE_WEBHOOK_NOT_CONFIGURED",
      "Stripe webhook verification is not configured.",
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

  if (event.livemode !== live) {
    return apiError(
      422,
      "STRIPE_EVENT_MODE_REJECTED",
      "This event does not match the configured payment mode.",
    );
  }

  if (!event.id || !event.type) {
    return apiError(
      422,
      "STRIPE_EVENT_INVALID",
      "The verified Stripe event is invalid.",
    );
  }

  if (!["checkout.session.completed", "checkout.session.async_payment_succeeded"].includes(event.type)) {
    return Response.json({ ok: true, received: true, processed: false, ignored: true }, { headers: { "Cache-Control": "no-store" } });
  }
  if (!event.sessionId || !isStripeSessionId(event.sessionId, dependencies.mode)) return apiError(422, "STRIPE_EVENT_INVALID", "A checkout session in the configured payment mode is required.");
  if (!dependencies.processSession) return apiError(503, "ORDER_RECEIVER_NOT_READY", "Payment processing is not configured. Retry this event.");
  try {
    const result = await dependencies.processSession(event.sessionId);
    return Response.json({ ok: true, received: true, testMode: !live, ...result }, { headers: { "Cache-Control": "no-store" } });
  } catch {
    // Stripe retries a failed delivery. Never consume an event before Odoo commits.
    return apiError(503, "ORDER_DELIVERY_RETRY_REQUIRED", "The paid order is awaiting processing. Retry this event.");
  }
}
