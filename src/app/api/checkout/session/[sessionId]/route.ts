import { getCommerceRepository } from "@/lib/commerce/runtime";
import {
  getVerifiedCheckoutStatus,
  isStripeTestSessionId,
} from "@/lib/commerce/checkout-status";
import { createStripeCommerceClient } from "@/lib/commerce/stripe-session";

export const dynamic = "force-dynamic";

function error(status: number, code: string, message: string) {
  return Response.json(
    { ok: false, error: { code, message } },
    { status, headers: { "Cache-Control": "no-store" } },
  );
}

export async function GET(
  request: Request,
  context: { params: Promise<{ sessionId: string }> },
) {
  const hostname = new URL(request.url).hostname;
  if (
    hostname !== "the-base-staging.mansua.workers.dev" &&
    hostname !== "localhost" &&
    hostname !== "127.0.0.1" &&
    hostname !== "[::1]"
  ) {
    return error(403, "STRIPE_TEST_HOST_REQUIRED", "Session verification is unavailable.");
  }

  const { sessionId } = await context.params;
  if (!isStripeTestSessionId(sessionId)) {
    return error(400, "STRIPE_SESSION_ID_INVALID", "The checkout session is invalid.");
  }
  const secretKey = process.env.STRIPE_SECRET_KEY?.trim();
  const repository = await getCommerceRepository();
  if (!secretKey?.startsWith("sk_test_") || !repository) {
    return error(503, "COMMERCE_RUNTIME_NOT_CONFIGURED", "Order verification is unavailable.");
  }

  const result = await getVerifiedCheckoutStatus({
    sessionId,
    repository,
    stripe: createStripeCommerceClient(secretKey),
  });
  if (!result.ok) {
    const message =
      result.code === "COMMERCE_ORDER_NOT_FOUND"
        ? "Order was not found."
        : "Payment status is temporarily unavailable.";
    return error(result.status, result.code, message);
  }

  return Response.json(
    {
      ok: true,
      order: result.order,
    },
    { status: 200, headers: { "Cache-Control": "no-store" } },
  );
}
