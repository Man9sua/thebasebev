import { createStripeClient } from "@/lib/stripe-client";
import { checkStripeCheckoutRateLimit } from "@/lib/stripe-rate-limit";
import { handleStripeSession } from "@/lib/stripe-session";
import { getShopPaymentRuntime } from "@/lib/shop-payment-runtime";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const rateLimit = checkStripeCheckoutRateLimit(request);
  if (!rateLimit.allowed) return Response.json({ ok: false, error: { code: "STRIPE_RATE_LIMITED", message: "Please wait before checking this payment again." } },
    { status: 429, headers: { "Cache-Control": "no-store", "Retry-After": String(rateLimit.retryAfterSeconds) } });
  const runtime = await getShopPaymentRuntime();
  return handleStripeSession(request, {
    mode: runtime.mode, liveOrigin: runtime.liveOrigin,
    secretKey: runtime.secretKey, orders: runtime.orders,
    retrieveSession: (key, sessionId) => createStripeClient(key).retrieveSession(sessionId),
  });
}
