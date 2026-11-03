import { handleStripeTestCheckout } from "@/lib/stripe-test-checkout";
import { createStripeTestClient } from "@/lib/stripe-test-client";
import { checkStripeTestCheckoutRateLimit } from "@/lib/stripe-test-rate-limit";
import { getShopPaymentRuntime } from "@/lib/shop-payment-runtime";

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

  const runtime = await getShopPaymentRuntime();
  return handleStripeTestCheckout(request, {
    secretKey: runtime.secretKey, orders: runtime.orders, taxRateId: runtime.taxRateId, orderReceiverReady: runtime.receiverReady,
    createClient: createStripeTestClient,
  });
}
