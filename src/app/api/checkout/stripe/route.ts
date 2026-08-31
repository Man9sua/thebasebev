import Stripe from "stripe";

import { getCommerceRepository } from "@/lib/commerce/runtime";
import { handleStripeTestCheckout } from "@/lib/stripe-test-checkout";
import { checkStripeTestCheckoutRateLimit } from "@/lib/stripe-test-rate-limit";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
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

  const repository = await getCommerceRepository();
  if (!repository) {
    return Response.json(
      {
        ok: false,
        error: {
          code: "COMMERCE_STORAGE_NOT_CONFIGURED",
          message: "Secure checkout storage is not configured.",
        },
      },
      { status: 503, headers: { "Cache-Control": "no-store" } },
    );
  }

  return handleStripeTestCheckout(request, {
    secretKey: process.env.STRIPE_SECRET_KEY,
    repository,
    environment: process.env,
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
