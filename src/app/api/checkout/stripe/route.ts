import Stripe from "stripe";

import { handleStripeTestCheckout } from "@/lib/stripe-test-checkout";

export const dynamic = "force-dynamic";

export function POST(request: Request) {
  return handleStripeTestCheckout(request, {
    secretKey: process.env.STRIPE_SECRET_KEY,
    createClient: (secretKey) => {
      const stripe = new Stripe(secretKey, {
        httpClient: Stripe.createFetchHttpClient(),
        maxNetworkRetries: 1,
        timeout: 10_000,
      });

      return {
        createSession: (params, options) =>
          stripe.checkout.sessions.create(params, options),
      };
    },
  });
}
