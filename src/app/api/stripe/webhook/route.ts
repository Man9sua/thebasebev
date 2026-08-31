import {
  handleStripeTestWebhook,
} from "@/lib/stripe-test-webhook";
import { createCommerceNotifier } from "@/lib/commerce/notification";
import { createOdooCommerceService } from "@/lib/commerce/odoo";
import { getCommerceRepository } from "@/lib/commerce/runtime";
import { createStripeCommerceClient } from "@/lib/commerce/stripe-session";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const repository = await getCommerceRepository();
  const secretKey = process.env.STRIPE_SECRET_KEY?.trim();
  if (!repository || !secretKey?.startsWith("sk_test_")) {
    return Response.json(
      {
        ok: false,
        error: {
          code: "COMMERCE_RUNTIME_NOT_CONFIGURED",
          message: "Commerce runtime is not configured.",
        },
      },
      { status: 503, headers: { "Cache-Control": "no-store" } },
    );
  }

  let odoo = null;
  try {
    odoo = createOdooCommerceService(process.env);
  } catch {
    // The verified event is still persisted by the handler and remains
    // retryable. Configuration details are never exposed to Stripe.
  }

  return handleStripeTestWebhook(request, {
    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
    repository,
    stripeClient: createStripeCommerceClient(secretKey),
    odoo,
    notifier: createCommerceNotifier(process.env),
  });
}
