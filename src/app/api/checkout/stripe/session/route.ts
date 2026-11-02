import { createStripeTestClient } from "@/lib/stripe-test-client";
import { checkStripeTestCheckoutRateLimit } from "@/lib/stripe-test-rate-limit";
import { handleStripeTestSession } from "@/lib/stripe-test-session";
import { getShopPaymentRuntime } from "@/lib/shop-payment-runtime";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const rateLimit = checkStripeTestCheckoutRateLimit(request);
  if (!rateLimit.allowed) return Response.json({ ok: false, error: { code: "STRIPE_TEST_RATE_LIMITED", message: "Please wait before checking this payment again." } },
    { status: 429, headers: { "Cache-Control": "no-store", "Retry-After": String(rateLimit.retryAfterSeconds) } });
  const runtime = await getShopPaymentRuntime();
  if (!runtime.orders) return Response.json({ ok: false, error: { code: "ORDER_STORE_UNAVAILABLE", message: "Payment verification is temporarily unavailable." } }, { status: 503, headers: { "Cache-Control": "no-store" } });
  return handleStripeTestSession(request, {
    secretKey: runtime.secretKey, orders: runtime.orders,
    retrieveSession: (key, sessionId) => createStripeTestClient(key).retrieveSession(sessionId),
  });
}
