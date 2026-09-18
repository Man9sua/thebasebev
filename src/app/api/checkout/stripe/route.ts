import Stripe from "stripe";

import { handleStripeTestCheckout } from "@/lib/stripe-test-checkout";
import { checkStripeTestCheckoutRateLimit } from "@/lib/stripe-test-rate-limit";

export const dynamic = "force-dynamic";

export function POST(request: Request) {
  const rateLimit = checkStripeTestCheckoutRateLimit(request);
  if (!rateLimit.allowed) {
    return Response.json(
      {
        ok: false,
        error: {
          code: "STRIPE_TEST_RATE_LIMITED",
          message: "Too many Stripe Test checkout requests.",
        },
      },
      {
        status: 429,
        headers: {
          "Cache-Control": "no-store",
          "Retry-After": String(rateLimit.retryAfterSeconds),
        },
      },
    );
  }

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
