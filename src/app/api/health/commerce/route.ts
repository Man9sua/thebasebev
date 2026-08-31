import { createOdooCommerceService } from "@/lib/commerce/odoo";
import { getCommerceRepository } from "@/lib/commerce/runtime";

export const dynamic = "force-dynamic";

export async function GET() {
  const repository = await getCommerceRepository();
  const stripeTestConfigured =
    process.env.STRIPE_SECRET_KEY?.trim().startsWith("sk_test_") === true;
  const odooEnabled =
    process.env.ODOO_COMMERCE_ENABLED?.trim().toLowerCase() === "true";

  let odoo: { enabled: boolean; reachable: boolean; version?: string } = {
    enabled: odooEnabled,
    reachable: false,
  };
  if (odooEnabled) {
    try {
      const service = createOdooCommerceService(process.env);
      const health = await service?.health();
      odoo = {
        enabled: true,
        reachable: Boolean(health?.json2),
        version: health?.version || undefined,
      };
    } catch {
      odoo = { enabled: true, reachable: false };
    }
  }

  const storageConfigured = repository !== null;
  return Response.json(
    {
      status:
        storageConfigured && stripeTestConfigured ? "ok" : "degraded",
      environment: process.env.APP_ENV === "staging" ? "staging" : "unknown",
      storageConfigured,
      stripeTestConfigured,
      odoo,
    },
    {
      status: storageConfigured ? 200 : 503,
      headers: { "Cache-Control": "no-store" },
    },
  );
}
