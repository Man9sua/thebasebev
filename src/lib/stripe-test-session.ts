import { isAllowedStripeTestHost, isStripeTestKey, stripeApiError } from "@/lib/stripe-test-checkout";
import type Stripe from "stripe";
import type { OrderStore } from "./shop-order";
import { verifySessionSnapshot } from "./stripe-paid-order";

export type StripeSessionStatus = Stripe.Checkout.Session;
export type StripeSessionDependencies = Readonly<{
  secretKey?: string;
  retrieveSession: (secretKey: string, sessionId: string) => Promise<StripeSessionStatus>;
  orders?: OrderStore;
}>;

// A redirect/query string is not payment confirmation. Return only verified
// financial state; delivery details and the customer's identity stay private.
export async function handleStripeTestSession(request: Request, dependencies: StripeSessionDependencies) {
  const url = new URL(request.url);
  if (!isAllowedStripeTestHost(url.hostname)) return stripeApiError(403, "STRIPE_TEST_HOST_REQUIRED", "Test checkout verification is only available on staging and local development.");
  const sessionId = url.searchParams.get("session_id") ?? "";
  if (!/^cs_test_[A-Za-z0-9_]{1,180}$/.test(sessionId)) return stripeApiError(400, "INVALID_SESSION_ID", "The checkout session is invalid.");
  const secretKey = dependencies.secretKey?.trim();
  if (!isStripeTestKey(secretKey) || !secretKey) return stripeApiError(503, "STRIPE_TEST_KEY_REQUIRED", "Secure Test checkout verification is not configured.");
  if (!dependencies.orders) return stripeApiError(503, "ORDER_STORE_UNAVAILABLE", "Payment verification is temporarily unavailable.");
  try {
    const session = await dependencies.retrieveSession(secretKey, sessionId);
    const order = await dependencies.orders.bySession(sessionId);
    if (!order || session.id !== sessionId || !["open", "complete", "expired"].includes(session.status ?? "")) return stripeApiError(502, "STRIPE_TEST_SESSION_REJECTED", "The checkout session could not be verified.");
    verifySessionSnapshot(session, order, false);
    return Response.json({ ok: true, checkout: { sessionId, status: session.status, paymentStatus: session.payment_status,
      confirmed: session.status === "complete" && session.payment_status === "paid", kind: order.snapshot.kind, country: order.snapshot.country,
      currency: "aed", total: session.amount_total, shipping: order.snapshot.amounts.shipping,
      testMode: true, fulfilled: order.state === "fulfilled", quotation: order.state === "fulfilled" ? order.odooOrderName : null,
    } }, { headers: { "Cache-Control": "no-store" } });
  } catch { return stripeApiError(502, "STRIPE_TEST_UNAVAILABLE", "Checkout verification is temporarily unavailable. Please try again."); }
}
