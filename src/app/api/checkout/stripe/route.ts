import { handleStripeCheckout } from "@/lib/stripe-checkout";
import { createStripeClient } from "@/lib/stripe-client";
import { checkStripeCheckoutRateLimit } from "@/lib/stripe-rate-limit";
import { getShopPaymentRuntime } from "@/lib/shop-payment-runtime";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const rateLimit = checkStripeCheckoutRateLimit(request);
  if (!rateLimit.allowed) {
    return Response.json(
      {
        ok: false,
        error: {
          code: "STRIPE_RATE_LIMITED",
          message: "Too many checkout requests. Please try again shortly.",
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
  return handleStripeCheckout(request, {
    mode: runtime.mode, liveOrigin: runtime.liveOrigin,
    secretKey: runtime.secretKey, orders: runtime.orders, taxRateId: runtime.taxRateId, orderReceiverReady: runtime.receiverReady,
    createClient: createStripeClient,
  });
}
