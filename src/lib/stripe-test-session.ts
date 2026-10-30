import { isAllowedStripeTestHost, isStripeTestKey, SHOP_STRIPE_INTEGRATION, stripeApiError } from "@/lib/stripe-test-checkout";
import { isShopCountry } from "@/lib/shop-payment";

export type StripeSessionStatus = Readonly<{
  id: string; livemode: boolean; status: string | null; payment_status: string;
  currency: string | null; amount_total: number | null;
  shipping_cost?: { amount_total: number } | null;
  metadata: Record<string, string> | null;
}>;
export type StripeSessionDependencies = Readonly<{
  secretKey?: string;
  retrieveSession: (secretKey: string, sessionId: string) => Promise<StripeSessionStatus>;
}>;

function metadataAmount(value: string | undefined): number | null {
  if (!value || !/^\d{1,16}$/.test(value)) return null;
  const amount = Number(value);
  return Number.isSafeInteger(amount) ? amount : null;
}

// A redirect/query string is not payment confirmation. Return only verified
// financial state; delivery details and the customer's identity stay private.
export async function handleStripeTestSession(request: Request, dependencies: StripeSessionDependencies) {
  const url = new URL(request.url);
  if (!isAllowedStripeTestHost(url.hostname)) return stripeApiError(403, "STRIPE_TEST_HOST_REQUIRED", "Test checkout verification is only available on staging and local development.");
  const sessionId = url.searchParams.get("session_id") ?? "";
  if (!/^cs_test_[A-Za-z0-9_]{1,180}$/.test(sessionId)) return stripeApiError(400, "INVALID_SESSION_ID", "The checkout session is invalid.");
  const secretKey = dependencies.secretKey?.trim();
  if (!isStripeTestKey(secretKey) || !secretKey) return stripeApiError(503, "STRIPE_TEST_KEY_REQUIRED", "Secure Test checkout verification is not configured.");
  try {
    const session = await dependencies.retrieveSession(secretKey, sessionId);
    const subtotal = metadataAmount(session.metadata?.tb_subtotal);
    const shipping = metadataAmount(session.metadata?.tb_shipping);
    const total = metadataAmount(session.metadata?.tb_total);
    const confirmed = session.status === "complete" && session.payment_status === "paid";
    if (session.id !== sessionId || session.livemode || session.currency !== "aed"
      || session.metadata?.integration !== SHOP_STRIPE_INTEGRATION
      || !["products", "samples"].includes(session.metadata.kind)
      || !isShopCountry(session.metadata.country)
      || !["open", "complete", "expired"].includes(session.status ?? "")
      || !["paid", "unpaid", "no_payment_required"].includes(session.payment_status)
      || subtotal === null || shipping === null || total === null || total <= 0 || subtotal + shipping !== total
      || (session.metadata.kind === "samples" && (subtotal !== 0 || shipping <= 0))
      || (session.amount_total !== null && (!Number.isSafeInteger(session.amount_total) || session.amount_total < 0))
      || (session.shipping_cost && (!Number.isSafeInteger(session.shipping_cost.amount_total) || session.shipping_cost.amount_total < 0))
      || (confirmed && (session.amount_total !== total || session.shipping_cost?.amount_total !== shipping))) {
      return stripeApiError(502, "STRIPE_TEST_SESSION_REJECTED", "The checkout session could not be verified.");
    }
    return Response.json({ ok: true, checkout: {
      sessionId, status: session.status, paymentStatus: session.payment_status,
      confirmed,
      kind: session.metadata.kind, country: session.metadata.country,
      currency: "aed", total: session.amount_total, shipping: session.shipping_cost?.amount_total ?? null,
      testMode: true, fulfilled: false,
    } }, { headers: { "Cache-Control": "no-store" } });
  } catch { return stripeApiError(502, "STRIPE_TEST_UNAVAILABLE", "Checkout verification is temporarily unavailable. Please try again."); }
}
