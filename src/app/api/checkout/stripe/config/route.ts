import { getShopPaymentRuntime } from "@/lib/shop-payment-runtime";
import { isAllowedStripeHost } from "@/lib/stripe-mode";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const runtime = await getShopPaymentRuntime();
  const allowed = isAllowedStripeHost(new URL(request.url), runtime);
  return Response.json({ ok: true, payment: { ready: runtime.receiverReady && allowed, mode: allowed ? runtime.mode : null } },
    { headers: { "Cache-Control": "no-store" } });
}
