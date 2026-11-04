import { stripeApiError } from "./stripe-checkout";
import { isAllowedStripeHost, isStripeKey, isStripeSessionId, type StripePolicy } from "./stripe-mode";
import type Stripe from "stripe";
import type { OrderStore } from "./shop-order";
import { verifySessionSnapshot } from "./stripe-paid-order";

export type StripeSessionStatus = Stripe.Checkout.Session;
export type StripeSessionDependencies = StripePolicy & Readonly<{
  secretKey?: string;
  retrieveSession: (secretKey: string, sessionId: string) => Promise<StripeSessionStatus>;
  orders?: OrderStore;
}>;

// A redirect/query string is not payment confirmation. Return only verified
// financial state; delivery details and the customer's identity stay private.
export async function handleStripeSession(request: Request, dependencies: StripeSessionDependencies) {
  const url = new URL(request.url);
  const mode = dependencies.mode ?? "test";
  if (!isAllowedStripeHost(url, dependencies)) return stripeApiError(403, "STRIPE_HOST_REJECTED", "Checkout verification is unavailable on this hostname.");
  const sessionId = url.searchParams.get("session_id") ?? "";
  if (!isStripeSessionId(sessionId, mode)) return stripeApiError(400, "INVALID_SESSION_ID", "The checkout session is invalid.");
  const secretKey = dependencies.secretKey?.trim();
  if (!isStripeKey(secretKey, mode) || !secretKey) return stripeApiError(503, "STRIPE_MODE_KEY_REQUIRED", "Secure checkout verification is not configured.");
  if (!dependencies.orders) return stripeApiError(503, "ORDER_STORE_UNAVAILABLE", "Payment verification is temporarily unavailable.");
  try {
    const session = await dependencies.retrieveSession(secretKey, sessionId);
    const order = await dependencies.orders.bySession(sessionId);
    if (!order || session.id !== sessionId || !["open", "complete", "expired"].includes(session.status ?? "")) return stripeApiError(502, "STRIPE_SESSION_REJECTED", "The checkout session could not be verified.");
    verifySessionSnapshot(session, order, false, mode);
    return Response.json({ ok: true, checkout: { sessionId, status: session.status, paymentStatus: session.payment_status,
      confirmed: session.status === "complete" && session.payment_status === "paid", kind: order.snapshot.kind, country: order.snapshot.country,
      currency: "aed", total: session.amount_total, shipping: order.snapshot.amounts.shipping,
      testMode: mode === "test", fulfilled: order.state === "fulfilled", quotation: order.state === "fulfilled" ? order.odooOrderName : null,
    } }, { headers: { "Cache-Control": "no-store" } });
  } catch { return stripeApiError(502, "STRIPE_UNAVAILABLE", "Checkout verification is temporarily unavailable. Please try again."); }
}
