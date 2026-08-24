import {
  handleStripeTestWebhook,
  InMemoryStripeEventRegistry,
} from "@/lib/stripe-test-webhook";

export const dynamic = "force-dynamic";

const eventRegistry = new InMemoryStripeEventRegistry();

export function POST(request: Request) {
  return handleStripeTestWebhook(request, {
    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
    eventRegistry,
  });
}
