import Stripe from "stripe";

const DEFAULT_EVENT_REGISTRY_LIMIT = 1_000;

export type VerifiedStripeEvent = Readonly<{
  id: string;
  type: string;
  livemode: boolean;
}>;

export type VerifyStripeEvent = (
  payload: string,
  signature: string,
  webhookSecret: string,
) => Promise<VerifiedStripeEvent>;

export class InMemoryStripeEventRegistry {
  private readonly eventIds = new Set<string>();

  constructor(private readonly limit = DEFAULT_EVENT_REGISTRY_LIMIT) {}

  claim(eventId: string) {
    if (this.eventIds.has(eventId)) return false;

    this.eventIds.add(eventId);
    if (this.eventIds.size > this.limit) {
      const oldestEventId = this.eventIds.values().next().value;
      if (oldestEventId) this.eventIds.delete(oldestEventId);
    }

    return true;
  }
}

export type StripeWebhookDependencies = Readonly<{
  webhookSecret?: string;
  eventRegistry: InMemoryStripeEventRegistry;
  verifyEvent?: VerifyStripeEvent;
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

  return { id: event.id, type: event.type, livemode: event.livemode };
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

  // Signature verification requires the exact raw request body.
  const payload = await request.text();
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

  const firstDelivery = dependencies.eventRegistry.claim(event.id);

  // Proof of concept only: verified events are acknowledged but deliberately
  // do not create an order, write to Odoo, or send Telegram notifications.
  return Response.json(
    {
      ok: true,
      received: true,
      duplicate: !firstDelivery,
      processed: false,
      testMode: true,
    },
    { status: 200, headers: { "Cache-Control": "no-store" } },
  );
}
